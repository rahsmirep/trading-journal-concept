const express = require('express');       // ✅ Import Express framework
const cors = require('cors');             // ✅ Import CORS middleware
const tradeRoutes = require('./routes/trades'); // ✅ Import trade route module

const app = express();                    // ✅ Initialize Express app

// ✅ Middleware
app.use(cors());                          // Enables cross-origin requests
app.use(express.json());                  // Parses incoming JSON bodies

// ✅ API Routes
app.use('/api/trades', tradeRoutes);      // Mounts trade routes at /api/trades
// Also mount the same routes (compatibility) at /trades for PowerShell or legacy calls
app.use('/trades', tradeRoutes);

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('Backend is alive');           // Confirms server is running
});

// ✅ Server Boot
const PORT = 3000;
// Bind to 0.0.0.0 so the server accepts IPv4 connections from localhost (127.0.0.1)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`); // Logs server status
});

app.get('/trades', (req, res) => {
  db.query('SELECT * FROM trades ORDER BY entry_date DESC', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.use(express.json());
app.post('/trades', (req, res) => {
  const { symbol, entry_date, exit_date, pnl, strategy } = req.body;

  if (!symbol || !entry_date || pnl === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO trades (symbol, entry_date, exit_date, pnl, strategy)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [symbol, entry_date, exit_date, pnl, strategy], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Trade added successfully', trade_id: result.insertId });
  });
});
