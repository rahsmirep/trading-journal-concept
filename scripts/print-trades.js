const db = require('../db/db');

(async () => {
  try {
    const cols = await db.query('SHOW COLUMNS FROM trades');
    console.log('Table columns:', cols.map(c => c.Field));
    const rows = await db.query('SELECT * FROM trades ORDER BY timestamp DESC LIMIT 100');
    console.log('Row count:', rows.length);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error querying trades:', err.message);
    process.exit(1);
  }
})();
