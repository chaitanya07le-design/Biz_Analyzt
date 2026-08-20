const toNumber = (value) => Number.parseFloat(value) || 0;
const contentOf = (response) => Array.isArray(response?.content) ? response.content : [];

const adaptCashBank = (templates) => ({
  accounts: contentOf(templates[38]).map((row) => ({
    name: row.ledger_name,
    group: row.group_name,
    openingBalance: Math.abs(toNumber(row.opening_balance)),
    closingBalance: Math.abs(toNumber(row.closing_balance)),
  })),
  cashPositionLastWeek: contentOf(templates[27])[0]?.cash_position_last_week ?? null,
  bankEntries: contentOf(templates[17]),
});

module.exports = { adaptCashBank };
