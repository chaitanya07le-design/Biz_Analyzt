require('dotenv').config({ path: './backend/.env' });
const { executeTemplate } = require('./backend/src/services/tallyService');
const { getTallyAuth } = require('./backend/src/services/authService');
async function run() {
  try {
    const auth = await getTallyAuth();
    console.log('Fetching T12...');
    const t12 = await executeTemplate(12, auth);
    console.log('T12:', JSON.stringify(t12.content[0]));
    console.log('Fetching T6...');
    const t6 = await executeTemplate(6, auth);
    console.log('T6:', JSON.stringify(t6.content[0]));
  } catch(e) {
    console.error(e);
  }
}
run();
