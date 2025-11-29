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

// Export the app for testing frameworks (e.g. supertest) without starting another server
module.exports = app;
