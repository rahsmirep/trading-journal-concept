const express = require('express');
const router = express.Router();

// In-memory store for development /fallback
const trades = [];

// GET /api/trades - list all trades
router.get('/', (req, res) => {
	res.json(trades);
});

// POST /api/trades - create a new trade
router.post('/', (req, res) => {
	const trade = req.body || {};
	trade.id = trades.length + 1;
	trades.push(trade);
	res.status(201).json(trade);
});

module.exports = router;

