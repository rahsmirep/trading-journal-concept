const express = require('express');
const router = express.Router();
const db = require('../../db/db');
const auth = require('../middleware/auth');

// Protect all trade routes - user must be authenticated
router.use(auth);

// Local in-memory fallback in case DB is offline
const fallbackTrades = [];

// Helper: Map DB row to API object
function mapRowToTrade(row) {
	return {
		id: row.id,
		ticker: row.ticker,
		entry: row.entry === null ? null : parseFloat(row.entry),
		exit: row.exit_price === null ? null : parseFloat(row.exit_price),
		size: parseFloat(row.size),
		direction: row.direction,
		notes: row.notes,
		entry_date: row.entry_date,
		exit_date: row.exit_date,
		timestamp: row.timestamp,
	};
}

// GET /api/trades - list all trades
router.get('/', async (req, res) => {
	try {
		const rows = await db.query('SELECT * FROM trades ORDER BY timestamp DESC', []);
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
	// Accept either the native schema (ticker/entry/exit/size/direction/notes)
	// or legacy/frontend schema (symbol/entry_date/exit_date/pnl/strategy)
	let { ticker, entry, exit, size, direction, notes, pnl, strategy } = body;
	const entry_date = body.entry_date || null;
	const exit_date = body.exit_date || null;
	// Support legacy payload: convert to internal schema
	if (!ticker && body.symbol) {
		ticker = body.symbol;
		// entry/exit/size may not exist in legacy payload; set 0 or null as default
		entry = body.entry || 0;
		exit = body.exit || 0;
		size = body.size || 0;
		// Derive direction from pnl if possible, else fallback
		if (!direction && typeof body.pnl === 'number') {
			direction = body.pnl >= 0 ? 'long' : 'short';
		}
		// Collate legacy fields into notes for traceability
		const extras = [];
		if (body.strategy) extras.push(`strategy: ${body.strategy}`);
		if (body.entry_date) extras.push(`entry_date: ${body.entry_date}`);
		if (body.exit_date) extras.push(`exit_date: ${body.exit_date}`);
		if (typeof body.pnl !== 'undefined') extras.push(`pnl: ${body.pnl}`);
		notes = (notes ? notes + ' | ' : '') + extras.join(' | ');
		// Capture legacy pnl and strategy fields explicitly
		pnl = typeof body.pnl !== 'undefined' ? body.pnl : pnl;
		strategy = body.strategy || strategy;
	}

	if (!ticker || typeof entry === 'undefined' || typeof exit === 'undefined' || typeof size === 'undefined') {
		return res.status(400).json({ error: 'Missing required fields (ticker, entry, exit, size)' });
	}

	try {
		// Use `exit_price` column and include date fields in the insert
		const sql = "INSERT INTO trades (ticker, entry, exit_price, size, direction, notes, pnl, strategy, entry_date, exit_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		const result = await db.query(sql, [ticker, entry, exit, size, direction || null, notes || null, pnl || null, strategy || null, entry_date, exit_date]);
		const rows = await db.query('SELECT * FROM trades WHERE id = ?', [result.insertId]);
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

