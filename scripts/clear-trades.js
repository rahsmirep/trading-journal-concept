const db = require('../db/db');

(async () => {
  try {
    await db.query('DELETE FROM trades');
    console.log('All trades deleted from database (DELETE FROM trades executed)');
    const count = await db.query('SELECT COUNT(*) AS c FROM trades');
    console.log('Remaining rows:', count[0].c);
    process.exit(0);
  } catch (err) {
    console.error('Error deleting trades:', err.message);
    process.exit(1);
  }
})();
