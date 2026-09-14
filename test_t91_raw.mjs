fetch('http://localhost:5001/api/tally/outstanding-group-view/template', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data.data.raw, null, 2)))
  .catch(console.error);
