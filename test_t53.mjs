fetch('http://localhost:5001/api/tally/receipt-payment-vouchers/template', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data.data.vouchers.slice(0,3), null, 2)))
  .catch(console.error);
