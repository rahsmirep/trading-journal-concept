const mysql = require('mysql2');
const path = require('path');
// Explicitly load the backend .env so variables are available regardless of cwd
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
} catch (err) {
    // If dotenv isn't installed, warn but continue — process.env may be set externally
    console.warn('dotenv not installed; make sure environment variables are available externally');
}

const db = mysql.createConnection({
    host: (process.env.DB_HOST || 'localhost').trim(),
    user: (process.env.DB_USER || 'root').trim(),
    password: (process.env.DB_PASS || '').trim(),
    database: (process.env.DB_NAME || 'trade_journal').trim(),
});

// Optional: Test connection on startup and provide helpful error output
db.connect((err) => {
    if (err) {
        console.error('Unable to connect to MySQL database:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = db;