const mysql = require('mysql2/promise');
const path = require('path');
// Explicitly load the backend .env so variables are available regardless of cwd
try {
    require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
} catch (err) {
    // If dotenv isn't installed, warn but continue — process.env may be set externally
    console.warn('dotenv not installed; make sure environment variables are available externally');
}

let db = null;

const initDb = async () => {
    try {
        db = await mysql.createConnection({
            host: (process.env.DB_HOST || 'localhost').trim(),
            user: (process.env.DB_USER || 'root').trim(),
            password: (process.env.DB_PASS || '').trim(),
            database: (process.env.DB_NAME || 'trade_journal').trim(),
        });
        console.log('Connected to MySQL database');
        return db;
    } catch (err) {
        console.error('Unable to connect to MySQL database:', err.message);
        throw err;
    }
};

// Initialize connection on module load
initDb().catch(err => console.error('Failed to initialize database:', err));

module.exports = {
    query: async (sql, args) => {
        if (!db) {
            await initDb();
        }
        const [results] = await db.execute(sql, args);
        return results;
    },
    getConnection: () => db
};