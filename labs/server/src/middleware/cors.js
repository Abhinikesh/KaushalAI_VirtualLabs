const cors = require('cors');

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
];

/**
 * Production-hardened CORS configuration
 * Strictly whitelists the main website frontend, the labs Vercel frontend, and local dev origins.
 * Wildcard (*) origins are completely forbidden.
 */
const configureCors = () => {
  const customOrigins = [];

  if (process.env.MAIN_APP_URL) {
    customOrigins.push(process.env.MAIN_APP_URL.trim().replace(/\/+$/, '').toLowerCase());
  }
  if (process.env.LABS_CLIENT_URL) {
    customOrigins.push(process.env.LABS_CLIENT_URL.trim().replace(/\/+$/, '').toLowerCase());
  }
  if (process.env.ALLOWED_ORIGIN) {
    process.env.ALLOWED_ORIGIN.split(',').forEach((o) => {
      const trimmed = o.trim().replace(/\/+$/, '').toLowerCase();
      if (trimmed) customOrigins.push(trimmed);
    });
  }

  const allowedOrigins = [...new Set([...defaultDevOrigins.map((o) => o.toLowerCase()), ...customOrigins])];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server callbacks)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/+$/, '').toLowerCase();
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      const error = new Error(`CORS policy violation: Origin '${origin}' is not authorized.`);
      error.status = 403;
      return callback(error, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Admin-Key', 'X-Labs-Webhook-Secret']
  });
};

module.exports = configureCors;
