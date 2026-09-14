const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const blinkitRoutes = require('./routes/blinkit');
const zeptoRoutes = require('./routes/zepto');
const instamartRoutes = require('./routes/instamart');
const searchRoutes = require('./routes/search');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// Routes
app.use('/api/blinkit', blinkitRoutes);
app.use('/api/zepto', zeptoRoutes);
app.use('/api/instamart', instamartRoutes);
app.use('/api', searchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
