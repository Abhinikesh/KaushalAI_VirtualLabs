require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const configureCors = require('./src/middleware/cors');
const connectDB = require('./src/config/db');

const healthRoutes = require('./src/routes/health.routes');
const indexRoutes = require('./src/routes/index.routes');
const sessionRoutes = require('./src/routes/session.routes');
const labsRoutes = require('./src/routes/labs.routes');
const { seedLabs } = require('./src/services/seedLabs.service');

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Body parsing middleware
app.use(helmet());
app.use(configureCors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to isolated Labs MongoDB and auto-seed initial labs
connectDB().then(() => {
  seedLabs();
});

// Mount Routes
app.use('/', indexRoutes);
app.use('/', healthRoutes);
app.use('/api/lab-session', sessionRoutes);
app.use('/api', labsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`[Server Error] ${err.message}`);
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`[KaushalAI Labs Backend] Running on http://localhost:${PORT}`);
  console.log(`[KaushalAI Labs Backend] Health Check available at http://localhost:${PORT}/health`);
});

module.exports = { app, server };
