export function calculateProfitLoss(vouchers, voucherLines, ledgers, groups) {
  if (!vouchers || !groups) {
    return {
      income: { direct: 0, indirect: 0, total: 0, ledgers: { direct: [], indirect: [] } },
      expenses: { purchase: 0, direct: 0, indirect: 0, totalDirect: 0, total: 0, ledgers: { purchase: [], direct: [], indirect: [] } },
      grossProfit: 0,
      netProfit: 0
    };
  }

  const groupMap = new Map();
  if (groups) {
    groups.forEach(g => {
      groupMap.set(g.GroupID, g);
    });
  }

  const ledgerMap = new Map();
  if (ledgers) {
    ledgers.forEach(l => {
      ledgerMap.set(l.LedgerID, l);
    });
  }

  const salesTotal = vouchers
    .filter(v => v.VoucherType === 'Sales')
    .reduce((sum, v) => sum + parseFloat(v.GrandTotal || 0), 0);

  const purchaseTotal = vouchers
    .filter(v => v.VoucherType === 'Purchase')
    .reduce((sum, v) => sum + parseFloat(v.GrandTotal || 0), 0);

  const expenseLedgers = { purchase: [], direct: [], indirect: [] };
  const incomeLedgers = { direct: [], indirect: [] };
  
  let directExpenseGroupTotal = 0;
  let indirectExpenseGroupTotal = 0;
  let indirectIncomeGroupTotal = 0;

  if (voucherLines && voucherLines.length > 0) {
    const expenseLedgerMap = new Map();
    const incomeLedgerMap = new Map();

    voucherLines.forEach(line => {
      if (line.LineType !== 'Ledger') return;
      if (!line.LedgerID) return;

      const ledger = ledgerMap.get(line.LedgerID);
      if (!ledger) return;

      const group = groupMap.get(ledger.GroupID);
      if (!group) return;

      if (group.StatementType !== 'P&L') return;

      const debit = parseFloat(line.LedgerDebit || 0);
      const credit = parseFloat(line.LedgerCredit || 0);

      if (group.Nature === 'Expense') {
        const ledgerKey = ledger.LedgerID;
        
        if (group.GroupName === 'Direct Expenses') {
          directExpenseGroupTotal += debit;
          if (!expenseLedgerMap.has(`direct-${ledgerKey}`)) {
            expenseLedgerMap.set(`direct-${ledgerKey}`, {
              id: ledger.LedgerID,
              name: ledger.LedgerName,
              groupName: group.GroupName,
              amount: 0
            });
          }
          expenseLedgerMap.get(`direct-${ledgerKey}`).amount += debit;
        } else if (group.GroupName === 'Indirect Expenses') {
          indirectExpenseGroupTotal += debit;
          if (!expenseLedgerMap.has(`indirect-${ledgerKey}`)) {
            expenseLedgerMap.set(`indirect-${ledgerKey}`, {
              id: ledger.LedgerID,
              name: ledger.LedgerName,
              groupName: group.GroupName,
              amount: 0
            });
          }
          expenseLedgerMap.get(`indirect-${ledgerKey}`).amount += debit;
        }
      } else if (group.Nature === 'Income') {
        const ledgerKey = ledger.LedgerID;
        
        if (group.GroupName === 'Sales Accounts') {
          // Skip - sales computed at voucher level
        } else {
          indirectIncomeGroupTotal += credit;
          if (!incomeLedgerMap.has(`indirect-${ledgerKey}`)) {
            incomeLedgerMap.set(`indirect-${ledgerKey}`, {
              id: ledger.LedgerID,
              name: ledger.LedgerName,
              groupName: group.GroupName,
              amount: 0
            });
          }
          incomeLedgerMap.get(`indirect-${ledgerKey}`).amount += credit;
        }
      }
    });

    expenseLedgerMap.forEach(item => {
      if (item.groupName === 'Direct Expenses') {
        expenseLedgers.direct.push(item);
      } else if (item.groupName === 'Indirect Expenses') {
        expenseLedgers.indirect.push(item);
      }
    });

    incomeLedgerMap.forEach(item => {
      incomeLedgers.indirect.push(item);
    });
  }

  expenseLedgers.direct.sort((a, b) => b.amount - a.amount);
  expenseLedgers.indirect.sort((a, b) => b.amount - a.amount);
  incomeLedgers.indirect.sort((a, b) => b.amount - a.amount);

  const totalIncome = salesTotal + indirectIncomeGroupTotal;
  const totalDirectExpenses = purchaseTotal + directExpenseGroupTotal;
  const totalExpenses = totalDirectExpenses + indirectExpenseGroupTotal;
  const grossProfit = totalIncome - totalDirectExpenses;
  const netProfit = grossProfit + indirectIncomeGroupTotal - indirectExpenseGroupTotal;

  console.log('=== P&L Calculation Debug ===');
  console.log('Sales Total (voucher-level):', salesTotal);
  console.log('Purchase Total (voucher-level):', purchaseTotal);
  console.log('Direct Expenses Group (ledger-join):', directExpenseGroupTotal);
  console.log('Indirect Expenses Group (ledger-join):', indirectExpenseGroupTotal);
  console.log('Indirect Income Group (ledger-join):', indirectIncomeGroupTotal);
  console.log('Total Income:', totalIncome);
  console.log('Total Direct Expenses:', totalDirectExpenses);
  console.log('Gross Profit:', grossProfit);
  console.log('Net Profit:', netProfit);
  console.log('============================');

  return {
    income: {
      direct: salesTotal,
      indirect: indirectIncomeGroupTotal,
      total: totalIncome,
      ledgers: incomeLedgers
    },
    expenses: {
      purchase: purchaseTotal,
      direct: directExpenseGroupTotal,
      indirect: indirectExpenseGroupTotal,
      totalDirect: totalDirectExpenses,
      total: totalExpenses,
      ledgers: expenseLedgers
    },
    grossProfit,
    netProfit
  };
}
