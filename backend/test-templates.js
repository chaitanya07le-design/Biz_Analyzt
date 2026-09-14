require('dotenv').config();
const { executeTemplate } = require('./src/services/tallyService');
const { getTallyAuth } = require('./src/services/authService');
async function run() {
  try {
    const auth = await getTallyAuth();
    console.log('T12:', JSON.stringify((await executeTemplate(12, auth)).content[0]));
    console.log('T6:', JSON.stringify((await executeTemplate(6, auth)).content[0]));
  } catch(e) {
    console.error(e);
  }
}
run();
