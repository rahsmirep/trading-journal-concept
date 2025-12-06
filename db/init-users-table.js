const mysql = require('mysql2/promise');
const path = require('path');

// Load env variables
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const initUsersTable = async () => {
    const connection = await mysql.createConnection({
        host: (process.env.DB_HOST || 'localhost').trim(),
        user: (process.env.DB_USER || 'root').trim(),
        password: (process.env.DB_PASS || '').trim(),
        database: (process.env.DB_NAME || 'trade_journal').trim(),
    });

    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) NOT NULL UNIQUE,
                passwordHash VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await connection.execute(sql);
        console.log('✓ Users table created successfully');
        
        // Verify table exists
        const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
        if (tables.length > 0) {
            console.log('✓ Users table verified');
        }
        
    } catch (err) {
        console.error('Error creating users table:', err.message);
    } finally {
        await connection.end();
    }
};

initUsersTable();
