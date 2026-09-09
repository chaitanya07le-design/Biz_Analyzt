const toNumber = (value) => Number.parseFloat(value) || 0;
const contentOf = (response) => Array.isArray(response?.content) ? response.content : [];

const adaptCashBank = (templates) => {
  // Template 50: cash/bank account list with bank details (primary source)
  const t50Rows = contentOf(templates[50]);

  // Template 84: all ledgers with openingBalance, closingBalance (2331 rows — filter by LedgerID)
  const t84Rows = contentOf(templates[84]);
  // Build a quick lookup map from LedgerID → row
  const t84Map = {};
  t84Rows.forEach((row) => {
    if (row.LedgerID) t84Map[row.LedgerID] = row;
  });

  // Merge: Template 50 as base, enrich with Template 84 balance data via LedgerID
  const accounts = t50Rows.map((row) => {
    const t84 = t84Map[row.LedgerID] || {};
    return {
      id: row.LedgerID || row.AccountID,
      name: row.ledger_name || '—',
      group: row.group_name || '—',
      accountType: row.accountType || '—',
      // Balances: prefer Template 84 (has separate opening/closing), fallback to T50 current
      openingBalance: toNumber(t84.OpeningBalance || 0),
      closingBalance: toNumber(t84.ClosingBalance || row.current_balance_inr || 0),
      currentBalance: toNumber(row.current_balance_inr || 0),
      totalDebit: toNumber(t84.totalDebit || 0),
      totalCredit: toNumber(t84.totalCredit || 0),
      // Bank details from Template 50
      accountNumber: row.bank_account_number || null,
      bankName: row.bankName || null,
      ifsc: row.IFSC || null,
      branchName: row.branchName || null,
      // These are NULL in Tally currently — will auto-populate when Tally has data
      isActive: row.IsActive || null,
      location: row.Location || null,
      lastTransactionDate: row.last_transaction_date || null,
    };
  });

  // Template 38: opening/closing balance of bank and cash (legacy — still included as fallback)
  // If Template 50 returned no rows, fall back to Template 38
  const legacyAccounts = accounts.length === 0
    ? contentOf(templates[38]).map((row) => ({
        id: null,
        name: row.ledger_name,
        group: row.group_name,
        accountType: null,
        openingBalance: Math.abs(toNumber(row.opening_balance)),
        closingBalance: Math.abs(toNumber(row.closing_balance)),
        currentBalance: Math.abs(toNumber(row.closing_balance)),
        totalDebit: 0, totalCredit: 0,
        accountNumber: null, bankName: null, ifsc: null, branchName: null,
        isActive: null, location: null, lastTransactionDate: null,
      }))
    : [];

  return {
    accounts: accounts.length > 0 ? accounts : legacyAccounts,
    // Template 27: cash position — null if Tally has no recent data
    cashPositionLastWeek: contentOf(templates[27])[0]?.cash_position_last_week ?? null,
    // Template 17: bank ledger entries — empty array if Tally has no recent data
    bankEntries: contentOf(templates[17]),
  };
};

module.exports = { adaptCashBank };
