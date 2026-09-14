const axios = require('axios');
axios.post('http://localhost:5001/api/tally/outstanding-group-view/template')
  .then(r => console.log(JSON.stringify(r.data.data.receivables.slice(0,2), null, 2)))
  .catch(console.error);
