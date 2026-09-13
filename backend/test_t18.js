const { executeTemplate } = require('./src/services/tallyService');
const { getTallyAuth } = require('./src/services/tallyAuthService');

async function test() {
  const auth = await getTallyAuth();
  const t18Data = await executeTemplate(18, auth, {
    cust_from_date: '2024-04-01',
    cust_to_date: '2030-03-31',
  });
  const rows = t18Data.content || [];
  const types = new Set();
  rows.forEach(r => {
    types.add(r.voucher_type || r.voucherType || r.voucher_type_name || 'UNDEFINED');
  });
  console.log('Template 18 distinct voucher types:');
  console.log(Array.from(types));
}

test().catch(console.error);
