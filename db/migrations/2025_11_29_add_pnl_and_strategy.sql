-- Migration: Add pnl and strategy columns to trades table
ALTER TABLE trades
  ADD COLUMN pnl DECIMAL(12,4) NULL AFTER notes,
  ADD COLUMN strategy VARCHAR(100) NULL AFTER pnl;

-- Optional: Add entry_date/exit_date if not present (no-op if already added in earlier migration)
ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS entry_date DATE NULL AFTER timestamp,
  ADD COLUMN IF NOT EXISTS exit_date DATE NULL AFTER entry_date;
