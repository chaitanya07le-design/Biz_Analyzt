const express = require('express');
const router = express.Router();
const { fetchSheetData, clearCache, getCacheStats, SHEET_GIDS } = require('../services/csvService');

router.get('/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'ok', 
      timestamp: new Date().toISOString(),
      cache: getCacheStats()
    }
  });
});

router.get('/sheets/status', async (req, res) => {
  const results = await Promise.all(
    Object.entries(SHEET_GIDS).map(async ([name, gid]) => {
      try {
        const data = await fetchSheetData(name);
        return { name, gid, status: 'connected', rowCount: data.length };
      } catch (error) {
        return { name, gid, status: 'error', rowCount: 0, error: error.message };
      }
    })
  );

  const connected = results.filter(r => r.status === 'connected').length;
  res.json({
    success: true,
    data: {
      totalSheets: results.length,
      connectedSheets: connected,
      allConnected: connected === results.length,
      sheets: results,
      timestamp: new Date().toISOString(),
    }
  });
});

router.get('/cache/stats', (req, res) => {
  res.json(getCacheStats());
});

router.delete('/cache', (req, res) => {
  const { sheet } = req.query;
  clearCache(sheet);
  res.json({ message: sheet ? `Cache cleared for ${sheet}` : 'All cache cleared' });
});

const createDataRoute = (sheetName, companyIdField = null) => {
  return async (req, res) => {
    try {
      const { companyId } = req.query;
      console.log(`📞 API call to fetch: "${sheetName}" (companyId: ${companyId || 'all'})`);
      
      let data = await fetchSheetData(sheetName);
      
      if (companyId && companyIdField && data.length > 0 && data[0].hasOwnProperty(companyIdField)) {
        data = data.filter(row => row[companyIdField] === companyId);
      }
      
      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (error) {
      console.error(`Error fetching ${sheetName}:`, error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
};

router.get('/companies', createDataRoute('Companies'));
router.get('/users', createDataRoute('Users'));
router.get('/user-company-mapping', createDataRoute('UserCompanyMapping'));
router.get('/groups', createDataRoute('Groups', 'CompanyID'));
router.get('/ledgers', async (req, res) => {
  try {
    const { companyId } = req.query;

    const [ledgers, bankAccounts, cashAccounts] = await Promise.all([
      fetchSheetData('Ledgers'),
      fetchSheetData('BankAccounts'),
      fetchSheetData('CashAccounts'),
    ]);

    let companyLedgers = ledgers;
    if (companyId && ledgers.length > 0 && ledgers[0].hasOwnProperty('CompanyID')) {
      companyLedgers = ledgers.filter(l => l.CompanyID === companyId);
    }

    const bankLedgerIds = new Set(
      bankAccounts
        .filter(b => !companyId || b.CompanyID === companyId)
        .map(b => b.LedgerID)
    );
    const cashLedgerIds = new Set(
      cashAccounts
        .filter(c => !companyId || c.CompanyID === companyId)
        .map(c => c.LedgerID)
    );

    const bankBalanceMap = new Map();
    bankAccounts
      .filter(b => !companyId || b.CompanyID === companyId)
      .forEach(b => {
        const existing = bankBalanceMap.get(b.LedgerID) || 0;
        bankBalanceMap.set(b.LedgerID, existing + parseFloat(b.OpeningBalance || 0));
      });

    const cashBalanceMap = new Map();
    cashAccounts
      .filter(c => !companyId || c.CompanyID === companyId)
      .forEach(c => {
        const existing = cashBalanceMap.get(c.LedgerID) || 0;
        cashBalanceMap.set(c.LedgerID, existing + parseFloat(c.OpeningBalance || 0));
      });

    const enrichedLedgers = companyLedgers.map(ledger => {
      let openingBalance = parseFloat(ledger.OpeningBalance || 0);

      if (bankLedgerIds.has(ledger.LedgerID)) {
        openingBalance = bankBalanceMap.get(ledger.LedgerID) || openingBalance;
      } else if (cashLedgerIds.has(ledger.LedgerID)) {
        openingBalance = cashBalanceMap.get(ledger.LedgerID) || openingBalance;
      }

      return {
        ...ledger,
        OpeningBalance: openingBalance,
      };
    });

    res.json({
      success: true,
      count: enrichedLedgers.length,
      data: enrichedLedgers
    });
  } catch (error) {
    console.error('Error fetching ledgers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.get('/parties', createDataRoute('Parties', 'CompanyID'));
router.get('/item-categories', createDataRoute('ItemCategories'));
router.get('/item-groups', createDataRoute('ItemGroups'));
router.get('/items', createDataRoute('Items', 'CompanyID'));
router.get('/vouchers', createDataRoute('Vouchers', 'CompanyID'));
router.get('/voucher-lines', createDataRoute('VoucherLines', 'CompanyID'));
router.get('/orders', createDataRoute('Orders', 'CompanyID'));

router.get('/vouchers/:voucherId', async (req, res) => {
  try {
    const { voucherId } = req.params;
    const { companyId } = req.query;

    const [vouchers, voucherLines, items, ledgers] = await Promise.all([
      fetchSheetData('Vouchers'),
      fetchSheetData('VoucherLines'),
      fetchSheetData('Items'),
      fetchSheetData('Ledgers'),
    ]);

    const voucher = vouchers.find(v => v.VoucherID === voucherId);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
    }

    if (companyId && voucher.CompanyID !== companyId) {
      return res.status(403).json({
        success: false,
        error: 'Voucher does not belong to this company'
      });
    }

    const itemLines = voucherLines.filter(
      line => line.VoucherID === voucherId && line.LineType === 'Item'
    );

    const ledgerLines = voucherLines.filter(
      line => line.VoucherID === voucherId && line.LineType === 'Ledger'
    );

    const voucherItems = itemLines.map(line => {
      const item = items.find(i => i.ItemID === line.ItemID) || {};
      const gstPercent = parseFloat(item.GST) || 0;
      const lineAmount = parseFloat(line.Amount) || 0;
      const taxAmount = (lineAmount * gstPercent) / 100;

      return {
        name: item.ItemName || line.ItemID || 'Unknown Item',
        hsnSac: item.HSN || '',
        qty: parseFloat(line.Qty) || 0,
        unit: item.Unit || 'Pcs',
        rate: parseFloat(line.Rate) || 0,
        tax: gstPercent > 0 ? [{ type: 'GST', percent: gstPercent, amount: taxAmount }] : [],
        amount: lineAmount,
      };
    });

    const entries = ledgerLines.map(line => {
      const ledger = ledgers.find(lg => lg.LedgerID === line.LedgerID);
      return {
        ledgerName: ledger?.LedgerName || line.LedgerID,
        debit: parseFloat(line.LedgerDebit || 0),
        credit: parseFloat(line.LedgerCredit || 0),
      };
    });

    const paymentDetails = {};
    if (voucher.VoucherType === 'Receipt' || voucher.VoucherType === 'Payment') {
      const bankLine = ledgerLines.find(l => 
        parseFloat(l.LedgerDebit || 0) > 0 || parseFloat(l.LedgerCredit || 0) > 0
      );
      if (bankLine) {
        const bankLedger = ledgers.find(lg => lg.LedgerID === bankLine.LedgerID);
        if (bankLedger) {
          paymentDetails.ledgerName = bankLedger.LedgerName;
          paymentDetails.mode = bankLedger.LedgerName.toLowerCase().includes('bank') ? 'Bank' : 
                                bankLedger.LedgerName.toLowerCase().includes('cash') ? 'Cash' : 'Transfer';
          paymentDetails.refNo = bankLine.Narration || '';
        }
      }
    }

    res.json({
      success: true,
      data: {
        ...voucher,
        Items: voucherItems,
        Entries: entries,
        PaymentDetails: Object.keys(paymentDetails).length > 0 ? paymentDetails : undefined,
      }
    });
  } catch (error) {
    console.error('Error fetching voucher detail:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.get('/bank-accounts', createDataRoute('BankAccounts', 'CompanyID'));
router.get('/cash-accounts', createDataRoute('CashAccounts', 'CompanyID'));
router.get('/settings', createDataRoute('Settings', 'CompanyID'));
router.get('/reminder-log', createDataRoute('ReminderLog'));
router.get('/stock-batches', createDataRoute('StockBatches', 'CompanyID'));
router.get('/item-stock-status', createDataRoute('ItemStockStatus', 'CompanyID'));
router.get('/customer-movement', createDataRoute('CustomerMovement', 'CompanyID'));
router.get('/sync-log', createDataRoute('SyncLog', 'CompanyID'));
router.get('/geographic-summary', createDataRoute('GeographicSummary', 'CompanyID'));

router.get('/parties/:partyId', async (req, res) => {
  try {
    const { partyId } = req.params;
    const { companyId } = req.query;

    const [parties, vouchers] = await Promise.all([
      fetchSheetData('Parties'),
      fetchSheetData('Vouchers'),
    ]);

    const party = parties.find(p => p.PartyID === partyId);
    if (!party) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }

    if (companyId && party.CompanyID !== companyId) {
      return res.status(403).json({ success: false, error: 'Party does not belong to this company' });
    }

    const partyVouchers = vouchers.filter(v => 
      v.PartyID === partyId && v.IsDeleted !== 'TRUE'
    ).map(v => ({
      voucherId: v.VoucherID,
      voucherNo: v.VoucherNo,
      voucherType: v.VoucherType,
      date: v.VoucherDate,
      amount: parseFloat(v.GrandTotal || 0),
      status: v.Status,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        ...party,
        transactions: partyVouchers,
      }
    });
  } catch (error) {
    console.error('Error fetching party detail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { companyId } = req.query;

    const [items, voucherLines, vouchers] = await Promise.all([
      fetchSheetData('Items'),
      fetchSheetData('VoucherLines'),
      fetchSheetData('Vouchers'),
    ]);

    const item = items.find(i => i.ItemID === itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    if (companyId && item.CompanyID !== companyId) {
      return res.status(403).json({ success: false, error: 'Item does not belong to this company' });
    }

    const itemLines = voucherLines.filter(
      line => line.ItemID === itemId && line.LineType === 'Item'
    );

    const purchaseHistory = [];
    const salesHistory = [];

    itemLines.forEach(line => {
      const voucher = vouchers.find(v => v.VoucherID === line.VoucherID);
      if (!voucher || voucher.IsDeleted === 'TRUE') return;

      const entry = {
        voucherId: voucher.VoucherID,
        voucherNo: voucher.VoucherNo,
        date: voucher.VoucherDate,
        qty: parseFloat(line.Qty) || 0,
        rate: parseFloat(line.Rate) || 0,
        amount: parseFloat(line.Amount) || 0,
      };

      if (voucher.VoucherType === 'Purchase') {
        purchaseHistory.push(entry);
      } else if (voucher.VoucherType === 'Sales') {
        salesHistory.push(entry);
      }
    });

    purchaseHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    salesHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        ...item,
        purchaseHistory,
        salesHistory,
      }
    });
  } catch (error) {
    console.error('Error fetching item detail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

  router.get('/item-categories/:categoryId', async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { companyId } = req.query;

      const [categories, items] = await Promise.all([
        fetchSheetData('ItemCategories'),
        fetchSheetData('Items'),
      ]);

      const category = categories.find(c => c.CategoryID === categoryId);
      if (!category) {
        return res.status(404).json({ success: false, error: 'Category not found' });
      }

      const categoryItems = items
        .filter(i => i.CategoryID === categoryId && (!companyId || i.CompanyID === companyId))
        .map(item => ({
          itemId: item.ItemID,
          name: item.ItemName,
          unit: item.Unit,
          stock: parseFloat(item.OpeningStock || 0),
          saleRate: parseFloat(item.SaleRate || 0),
          gst: parseFloat(item.GST || 0),
        }));

      res.json({
        success: true,
        data: {
          ...category,
          items: categoryItems,
        }
      });
    } catch (error) {
      console.error('Error fetching category detail:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

router.get('/bank-accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { companyId } = req.query;

    const [bankAccounts, voucherLines, vouchers] = await Promise.all([
      fetchSheetData('BankAccounts'),
      fetchSheetData('VoucherLines'),
      fetchSheetData('Vouchers'),
    ]);

    const account = bankAccounts.find(b => b.AccountID === accountId);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Bank account not found' });
    }

    if (companyId && account.CompanyID !== companyId) {
      return res.status(403).json({ success: false, error: 'Account does not belong to this company' });
    }

    const transactions = voucherLines
      .filter(line => line.LedgerID === account.LedgerID)
      .map(line => {
        const voucher = vouchers.find(v => v.VoucherID === line.VoucherID);
        return {
          voucherId: line.VoucherID,
          voucherNo: voucher?.VoucherNo || '',
          date: voucher?.VoucherDate || '',
          type: voucher?.VoucherType || '',
          debit: parseFloat(line.LedgerDebit || 0),
          credit: parseFloat(line.LedgerCredit || 0),
        };
      })
      .filter(t => t.debit > 0 || t.credit > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        ...account,
        transactions,
      }
    });
  } catch (error) {
    console.error('Error fetching bank account detail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/cash-accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { companyId } = req.query;

    const [cashAccounts, voucherLines, vouchers] = await Promise.all([
      fetchSheetData('CashAccounts'),
      fetchSheetData('VoucherLines'),
      fetchSheetData('Vouchers'),
    ]);

    const account = cashAccounts.find(c => c.AccountID === accountId);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Cash account not found' });
    }

    if (companyId && account.CompanyID !== companyId) {
      return res.status(403).json({ success: false, error: 'Account does not belong to this company' });
    }

    const transactions = voucherLines
      .filter(line => line.LedgerID === account.LedgerID)
      .map(line => {
        const voucher = vouchers.find(v => v.VoucherID === line.VoucherID);
        return {
          voucherId: line.VoucherID,
          voucherNo: voucher?.VoucherNo || '',
          date: voucher?.VoucherDate || '',
          type: voucher?.VoucherType || '',
          debit: parseFloat(line.LedgerDebit || 0),
          credit: parseFloat(line.LedgerCredit || 0),
        };
      })
      .filter(t => t.debit > 0 || t.credit > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        ...account,
        transactions,
      }
    });
  } catch (error) {
    console.error('Error fetching cash account detail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/dashboard/summary', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'companyId query parameter is required'
      });
    }

    const [ledgers, parties, items, vouchers, bankAccounts, cashAccounts] = await Promise.all([
      fetchSheetData('Ledgers'),
      fetchSheetData('Parties'),
      fetchSheetData('Items'),
      fetchSheetData('Vouchers'),
      fetchSheetData('BankAccounts'),
      fetchSheetData('CashAccounts'),
    ]);

    const companyLedgers = ledgers.filter(l => l.CompanyID === companyId);
    const companyParties = parties.filter(p => p.CompanyID === companyId);
    const companyItems = items.filter(i => i.CompanyID === companyId);
    const companyVouchers = vouchers.filter(v => v.CompanyID === companyId);
    const companyBankAccounts = bankAccounts.filter(b => b.CompanyID === companyId);
    const companyCashAccounts = cashAccounts.filter(c => c.CompanyID === companyId);

    const totalSales = companyVouchers
      .filter(v => v.VoucherType === 'Sales')
      .reduce((sum, v) => sum + parseFloat(v.GrandTotal || 0), 0);

    const totalPurchases = companyVouchers
      .filter(v => v.VoucherType === 'Purchase')
      .reduce((sum, v) => sum + parseFloat(v.GrandTotal || 0), 0);

    const totalReceivables = companyParties
      .filter(p => p.PartyType === 'Sundry Debtors' || p.PartyType === 'Customer')
      .reduce((sum, p) => sum + parseFloat(p.OpeningBalance || 0), 0);

    const totalPayables = companyParties
      .filter(p => p.PartyType === 'Sundry Creditors' || p.PartyType === 'Supplier')
      .reduce((sum, p) => sum + Math.abs(parseFloat(p.OpeningBalance || 0)), 0);

    const bankBalance = companyBankAccounts.reduce((sum, b) =>
      sum + parseFloat(b.OpeningBalance || 0), 0
    );

    const cashInHand = companyCashAccounts.reduce((sum, c) =>
      sum + parseFloat(c.OpeningBalance || 0), 0
    );

    res.json({
      success: true,
      data: {
        totalSales,
        totalPurchases,
        totalReceivables,
        totalPayables,
        bankBalance,
        cashInHand,
        bankBalanceTotal: bankBalance + cashInHand,
        partyCount: companyParties.length,
        itemCount: companyItems.length,
        voucherCount: companyVouchers.length,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/outstanding/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'companyId query parameter is required'
      });
    }

    const parties = await fetchSheetData('Parties');
    const vouchers = await fetchSheetData('Vouchers');

    // Define voucher types that affect each direction
    // For receivables: Sales increases, Credit Note decreases, Receipt decreases
    // For payables: Purchase increases, Debit Note decreases, Payment decreases
    const receivableVoucherTypes = ['Sales', 'Credit Note', 'Receipt'];
    const payableVoucherTypes = ['Purchase', 'Debit Note', 'Payment'];
    
    // Define which voucher types increase the outstanding (vs decrease)
    const increaseTypes = {
      receivable: ['Sales'],
      payable: ['Purchase']
    };
    
    const partyTypes = type === 'receivable' 
      ? ['Sundry Debtors', 'Customer', 'Both'] 
      : ['Sundry Creditors', 'Supplier', 'Both'];
    
    const relevantVoucherTypes = type === 'receivable' ? receivableVoucherTypes : payableVoucherTypes;
    const increaseTypeList = increaseTypes[type];
    
    const companyParties = parties.filter(p => 
      p.CompanyID === companyId && partyTypes.includes(p.PartyType)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate Financial Year Start (April 1 of current FY in India)
    const currentFYStart = new Date(today.getFullYear(), today.getMonth() >= 3 ? 3 : 3, 1);
    if (today.getMonth() < 3) {
      currentFYStart.setFullYear(today.getFullYear() - 1);
    }

    const outstanding = companyParties.map(party => {
      // Filter vouchers by relevant types for this direction only
      // This ensures 'Both' type parties get correct treatment per direction
      const partyVouchers = vouchers.filter(v => 
        v.CompanyID === companyId && 
        v.PartyID === party.PartyID &&
        relevantVoucherTypes.includes(v.VoucherType) &&
        v.IsDeleted !== 'TRUE'
      );

      const creditDays = parseInt(party.CreditDays) || 0;

      // Separate invoices (Sales/Purchase) from payments (Receipt/Payment) and adjustments
      const invoices = partyVouchers
        .filter(v => increaseTypeList.includes(v.VoucherType))
        .map(v => ({
          voucherId: v.VoucherID,
          voucherNo: v.VoucherNo,
          voucherType: v.VoucherType,
          date: new Date(v.VoucherDate),
          amount: parseFloat(v.GrandTotal || v.NetAmount || 0),
          dueDate: new Date(new Date(v.VoucherDate).getTime() + creditDays * 24 * 60 * 60 * 1000),
          outstanding: parseFloat(v.GrandTotal || v.NetAmount || 0)
        }))
        .sort((a, b) => a.date - b.date);

      // Payments/Receipts that reduce outstanding (FIFO application)
      const payments = partyVouchers
        .filter(v => !increaseTypeList.includes(v.VoucherType))
        .map(v => ({
          voucherId: v.VoucherID,
          date: new Date(v.VoucherDate),
          amount: parseFloat(v.GrandTotal || v.NetAmount || 0)
        }))
        .sort((a, b) => a.date - b.date);

      // Apply payments against oldest invoices first (FIFO settlement)
      // Standard accounting assumption documented here
      let remainingPayment = payments.reduce((sum, p) => sum + p.amount, 0);
      invoices.forEach(inv => {
        if (remainingPayment > 0 && inv.outstanding > 0) {
          const applied = Math.min(inv.outstanding, remainingPayment);
          inv.outstanding -= applied;
          remainingPayment -= applied;
        }
      });

      // Function to bucket amount based on days overdue
      const getAgingBuckets = (amount, dueDate) => {
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        const buckets = {
          notDue: 0,
          overdue0to30: 0,
          overdue31to60: 0,
          overdue61to90: 0,
          over90: 0
        };
        
        if (amount <= 0) return buckets;
        
        if (daysOverdue <= 0) {
          buckets.notDue = amount;
        } else if (daysOverdue <= 30) {
          buckets.overdue0to30 = amount;
        } else if (daysOverdue <= 60) {
          buckets.overdue31to60 = amount;
        } else if (daysOverdue <= 90) {
          buckets.overdue61to90 = amount;
        } else {
          buckets.over90 = amount;
        }
        
        return buckets;
      };

      // Calculate aging for each invoice
      const invoiceAging = invoices.map(inv => ({
        ...inv,
        date: inv.date.toISOString().split('T')[0],
        dueDate: inv.dueDate.toISOString().split('T')[0],
        daysOverdue: Math.max(0, Math.floor((today - inv.dueDate) / (1000 * 60 * 60 * 24))),
        aging: getAgingBuckets(inv.outstanding, inv.dueDate)
      }));

      // Sum invoice aging buckets
      const invoiceAgingTotal = invoiceAging.reduce((acc, inv) => ({
        notDue: acc.notDue + inv.aging.notDue,
        overdue0to30: acc.overdue0to30 + inv.aging.overdue0to30,
        overdue31to60: acc.overdue31to60 + inv.aging.overdue31to60,
        overdue61to90: acc.overdue61to90 + inv.aging.overdue61to90,
        over90: acc.over90 + inv.aging.over90
      }), { notDue: 0, overdue0to30: 0, overdue31to60: 0, overdue61to90: 0, over90: 0 });

      // Handle OpeningBalance - place in appropriate bucket based on age
      // OpeningBalance represents carry-forward from before FinancialYearStart
      // Conservative approach: place entire OpeningBalance in Over90 bucket
      const openingBalance = parseFloat(party.OpeningBalance || 0);
      let obAging = { notDue: 0, overdue0to30: 0, overdue31to60: 0, overdue61to90: 0, over90: 0 };
      
      if (openingBalance !== 0) {
        // Calculate days since FY start to determine age of OpeningBalance
        const daysSinceFYStart = Math.floor((today - currentFYStart) / (1000 * 60 * 60 * 24));
        // OpeningBalance is from before FY start, so it's at least daysSinceFYStart old
        // Conservative: place in Over90 if >90 days, otherwise bucket appropriately
        if (daysSinceFYStart > 90) {
          obAging.over90 = Math.abs(openingBalance);
        } else if (daysSinceFYStart > 60) {
          obAging.overdue61to90 = Math.abs(openingBalance);
        } else if (daysSinceFYStart > 30) {
          obAging.overdue31to60 = Math.abs(openingBalance);
        } else {
          obAging.overdue0to30 = Math.abs(openingBalance);
        }
      }

      // Combine invoice aging with OpeningBalance aging
      const totalAging = {
        notDue: invoiceAgingTotal.notDue,
        overdue0to30: invoiceAgingTotal.overdue0to30 + obAging.overdue0to30,
        overdue31to60: invoiceAgingTotal.overdue31to60 + obAging.overdue31to60,
        overdue61to90: invoiceAgingTotal.overdue61to90 + obAging.overdue61to90,
        over90: invoiceAgingTotal.over90 + obAging.over90
      };

      const totalOutstanding = Object.values(totalAging).reduce((sum, v) => sum + v, 0);

      return {
        partyId: party.PartyID,
        partyName: party.PartyName,
        city: party.City,
        totalOutstanding: totalOutstanding,
        openingBalance: openingBalance,
        transactionCount: invoices.length,
        aging: totalAging,
        invoiceAging: invoiceAging.filter(inv => inv.outstanding > 0.01)
      };
    }).filter(p => p.totalOutstanding > 0.01);

    // Calculate grand totals for aging
    const grandTotals = outstanding.reduce((acc, p) => ({
      notDue: acc.notDue + p.aging.notDue,
      overdue0to30: acc.overdue0to30 + p.aging.overdue0to30,
      overdue31to60: acc.overdue31to60 + p.aging.overdue31to60,
      overdue61to90: acc.overdue61to90 + p.aging.overdue61to90,
      over90: acc.over90 + p.aging.over90
    }), { notDue: 0, overdue0to30: 0, overdue31to60: 0, overdue61to90: 0, over90: 0 });

    res.json({
      success: true,
      count: outstanding.length,
      data: outstanding,
      totals: grandTotals
    });
  } catch (error) {
    console.error('Error fetching outstanding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
