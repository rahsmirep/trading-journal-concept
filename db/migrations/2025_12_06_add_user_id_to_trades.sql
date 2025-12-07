-- Migration: Add user_id column to trades table for per-user trade association
ALTER TABLE trades ADD COLUMN user_id INT NOT NULL DEFAULT 1;
ALTER TABLE trades ADD CONSTRAINT fk_trades_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;