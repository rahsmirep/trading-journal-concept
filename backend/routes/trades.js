const express = require('express');
const router = express.Router();
const db = require('../../db/db');

// Local in-memory fallback in case DB is offline
const fallbackTrades = [];

// Helper: Map DB row to API object
function mapRowToTrade(row) {
	return {
		id: row.id,
		ticker: row.ticker,
		entry: parseFloat(row.entry),
		exit: parseFloat(row.exit),
		size: parseFloat(row.size),
		direction: row.direction,
		notes: row.notes,
		timestamp: row.timestamp,
	};
}

// GET /api/trades - list all trades
router.get('/', async (req, res) => {
	try {
		const [rows] = await db.promise().query('SELECT * FROM trades ORDER BY timestamp DESC');
		res.json(rows.map(mapRowToTrade));
	} catch (err) {
		// DB unavailable: return in-memory fallback
		console.warn('DB read failed; falling back to in-memory store:', err.message);
		res.json(fallbackTrades.slice().reverse());
	}
});

// POST /api/trades - create a new trade
router.post('/', async (req, res) => {
	const body = req.body || {};
	const { ticker, entry, exit, size, direction, notes } = body;

	if (!ticker || typeof entry === 'undefined' || typeof exit === 'undefined' || typeof size === 'undefined') {
		return res.status(400).json({ error: 'Missing required fields (ticker, entry, exit, size)' });
	}

	try {
		const sql = 'INSERT INTO trades (ticker, entry, exit, size, direction, notes) VALUES (?, ?, ?, ?, ?, ?)';
		const [result] = await db.promise().execute(sql, [ticker, entry, exit, size, direction || null, notes || null]);
		const [rows] = await db.promise().query('SELECT * FROM trades WHERE id = ?', [result.insertId]);
		if (rows.length === 0) return res.status(500).json({ error: 'Created trade not found' });
		return res.status(201).json(mapRowToTrade(rows[0]));
	} catch (err) {
		// If DB unavailable, fall back to in-memory store
		console.warn('DB insert failed; falling back to in-memory store:', err.message);
		const id = fallbackTrades.length + 1;
		const newTrade = { id, ticker, entry, exit, size, direction, notes, timestamp: new Date() };
		fallbackTrades.push(newTrade);
		return res.status(201).json(newTrade);
	}
});

module.exports = router;

