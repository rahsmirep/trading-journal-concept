-- Database for trading-journal-concept --
CREATE DATABASE trade_journal;
USE trade_journal;

CREATE TABLE trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    entry DECIMAL(10,4) NOT NULL,
    exit DECIMAL(10,4) NOT NULL,
    size DECIMAL(10,4) not null,
    direction ENUM('long', 'short'),
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
); 