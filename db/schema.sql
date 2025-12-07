-- Database for trading-journal-concept --
CREATE DATABASE trade_journal;
USE trade_journal;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    entry DECIMAL(10,4) NOT NULL,
    exit_price DECIMAL(10,4) NOT NULL,
    size DECIMAL(10,4) not null,
    direction ENUM('long', 'short'),
    notes TEXT,
    pnl DECIMAL(12,4) NULL,
    strategy VARCHAR(100) NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    entry_date DATE NULL,
    exit_date DATE NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);