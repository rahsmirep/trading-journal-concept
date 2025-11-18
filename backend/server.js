const express = require('express');       // ✅ Import Express framework
const cors = require('cors');             // ✅ Import CORS middleware
const tradeRoutes = require('./routes/trades'); // ✅ Import trade route module

const app = express();                    // ✅ Initialize Express app

// ✅ Middleware
app.use(cors());                          // Enables cross-origin requests
app.use(express.json());                  // Parses incoming JSON bodies

// ✅ API Routes
app.use('/api/trades', tradeRoutes);      // Mounts trade routes at /api/trades

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('Backend is alive');           // Confirms server is running
});

// ✅ Server Boot
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Logs server status
});
