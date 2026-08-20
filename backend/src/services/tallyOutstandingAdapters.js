const toNumber = (value) => Number.parseFloat(value) || 0;
const contentOf = (response) => Array.isArray(response?.content) ? response.content : [];

const bucketKeys = [
  ['bucket_0_30', 'overdue0to30'],
  ['bucket_31_60', 'overdue31to60'],
  ['bucket_61_90', 'overdue61to90'],
  ['bucket_above_90', 'over90'],
];

const aggregateBills = (rows, type) => {
  const parties = new Map();
  rows.forEach((row) => {
    const isReceivable = type === 'receivable';
    const amount = toNumber(isReceivable ? row.receivable_amount ?? row.outstanding_balance : row.payable_amount);
    if (amount <= 0) return;
    const name = row.customer_name || row.party_name || 'Unknown party';
    const party = parties.get(name) || {
      partyName: name,
      totalOutstanding: 0,
      transactionCount: 0,
      aging: { notDue: 0, overdue0to30: 0, overdue31to60: 0, overdue61to90: 0, over90: 0 },
      invoiceAging: [],
    };
    const aging = {};
    let overdueTotal = 0;
    bucketKeys.forEach(([source, destination]) => {
      aging[destination] = toNumber(row[source]);
      overdueTotal += aging[destination];
      party.aging[destination] += aging[destination];
    });
    aging.notDue = Math.max(0, amount - overdueTotal);
    party.aging.notDue += aging.notDue;
    party.totalOutstanding += amount;
    party.transactionCount += 1;
    party.invoiceAging.push({
      voucherId: `${name}-${row.ref_no || row.voucher_number || party.transactionCount}`,
      voucherNo: row.ref_no || row.voucher_number || '—',
      date: row.bill_date || row.reference_date || null,
      dueDate: row.due_date || null,
      daysOverdue: toNumber(row.overdue_days ?? row.due_days),
      outstanding: amount,
    });
    parties.set(name, party);
  });
  return [...parties.values()].sort((a, b) => b.totalOutstanding - a.totalOutstanding);
};

const adaptOutstanding = (templates) => {
  const billRows = contentOf(templates[37]);
  const payableRows = contentOf(templates[7]);
  return {
    receivables: aggregateBills(billRows.filter((row) => row.balance_type === 'RECEIVABLE'), 'receivable'),
    payables: aggregateBills(payableRows, 'payable'),
    customerTotal: toNumber(contentOf(templates[41])[0]?.amount),
    vendorTotal: toNumber(contentOf(templates[42])[0]?.amount),
    customerAgingRows: contentOf(templates[3]),
    receivablePartyAging: contentOf(templates[32]),
  };
};

module.exports = { adaptOutstanding };
