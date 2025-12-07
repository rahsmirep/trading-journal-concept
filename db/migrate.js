const db = require('./db');

async function runMigration() {
  try {
    console.log('Adding pnl and trade_time columns to trades table...');
    await db.query('ALTER TABLE trades ADD COLUMN IF NOT EXISTS pnl DECIMAL(12,4) NULL');
    console.log('✓ pnl column added');
    
    await db.query('ALTER TABLE trades ADD COLUMN IF NOT EXISTS trade_time TIME NULL');
    console.log('✓ trade_time column added');
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
