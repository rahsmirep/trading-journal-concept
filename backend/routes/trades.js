const express = require('express');
const router = express.Router();
const db = require('../../db/db');
const auth = require('../middleware/auth');


// DELETE /api/trades/:id - delete a trade by id
router.delete('/:id', async (req, res) => {
	const id = req.params.id;
	if (!id) return res.status(400).json({ error: 'Missing trade id' });
	try {
		// Log all trade ids before deletion
		const allTrades = await db.query('SELECT id FROM trades');
		console.log('[API] All trade ids before delete:', allTrades.map(t => t.id));
		const result = await db.query('DELETE FROM trades WHERE id = ?', [id]);
		if (result.affectedRows === 0) {
			console.warn(`[API] Trade id ${id} not found in DB. All ids:`, allTrades.map(t => t.id));
			return res.status(404).json({ error: 'Trade not found' });
		}
		console.log('[API] DELETE /api/trades/' + id + ' deleted');
		res.status(204).end();
	} catch (err) {
		console.warn('DB delete failed:', err.message);
		res.status(500).json({ error: 'Database unavailable' });
	}
});

// DELETE /api/trades - delete all trades for the authenticated user
router.delete('/', async (req, res) => {
	const userId = req.user && req.user.id;
	if (!userId) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const result = await db.query('DELETE FROM trades WHERE user_id = ?', [userId]);
		console.log(`[API] DELETE /api/trades for user ${userId}:`, result.affectedRows, 'trades deleted');
		res.status(204).end();
	} catch (err) {
		console.warn('DB bulk delete failed:', err.message);
		res.status(500).json({ error: 'Database unavailable' });
	}
});

// Protect all trade routes - user must be authenticated
router.use(auth);

// Removed in-memory fallback: only DB trades are used

// Helper: Map DB row to API object
function mapRowToTrade(row) {
	return {
		id: row.id,
		ticker: row.ticker,
		entry: row.entry === null ? null : parseFloat(row.entry),
		exit: row.exit_price === null ? null : parseFloat(row.exit_price),
		size: row.size === null ? null : parseFloat(row.size),
		pnl: (typeof row.pnl !== 'undefined' && row.pnl !== null) ? parseFloat(row.pnl) : null,
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
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		const rows = await db.query('SELECT * FROM trades WHERE user_id = ? ORDER BY timestamp DESC', [userId]);
		console.log(`[API] GET /api/trades for user ${userId} returned`, rows.length, 'rows');
		res.json(rows.map(mapRowToTrade));
	} catch (err) {
		// DB unavailable: return error only, never fallback
		console.warn('DB read failed:', err.message);
		res.status(500).json({ error: 'Database unavailable' });
	}
});

// POST /api/trades - create a new trade
router.post('/', async (req, res) => {
	const body = req.body || {};
	let { ticker, entry, exit, size, direction, notes, pnl, strategy } = body;
	console.log('[API] Received trade POST body:', body);
	console.log('[API] Parsed trade fields:', { ticker, entry, exit, size, direction, notes, pnl, strategy });
	const entry_date = body.entry_date || null;
	const exit_date = body.exit_date || null;
	const trade_time = body.trade_time || null;

	// Always default entry, exit, and size to 0 if undefined, so pnl is always included
	entry = (typeof entry === 'undefined' || entry === null) ? 0 : entry;
	exit = (typeof exit === 'undefined' || exit === null) ? 0 : exit;
	size = (typeof size === 'undefined' || size === null) ? 0 : size;

	if (!ticker) {
		return res.status(400).json({ error: 'Missing required field: ticker' });
	}

	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ error: 'Unauthorized' });
		// Always include pnl column and user_id (schema supports it)
		let sql = "INSERT INTO trades (user_id, ticker, entry, exit_price, size, direction, notes, pnl, strategy, entry_date, exit_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		let params = [userId, ticker, entry, exit, size, direction || null, notes || null, pnl || null, strategy || null, entry_date, exit_date];
		console.log('[API] SQL:', sql);
		console.log('[API] SQL params:', params);
		console.log('[API] SQL:', sql);
		console.log('[API] SQL params:', params);
		const result = await db.query(sql, params);
		const rows = await db.query('SELECT * FROM trades WHERE id = ?', [result.insertId]);
		if (rows.length === 0) return res.status(500).json({ error: 'Created trade not found' });
		console.log('[API] POST /api/trades inserted trade id', result.insertId);
		return res.status(201).json(mapRowToTrade(rows[0]));
	} catch (err) {
		// If DB unavailable, return error only, never fallback
		console.warn('DB insert failed:', err.message);
		return res.status(500).json({ error: 'Database unavailable' });
	}
});

module.exports = router;

