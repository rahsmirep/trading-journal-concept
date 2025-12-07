-- Add pnl and trade_time columns to trades table if they don't exist
ALTER TABLE trades ADD COLUMN IF NOT EXISTS pnl DECIMAL(12,4) NULL;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS trade_time TIME NULL;
