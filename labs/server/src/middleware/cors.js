const cors = require('cors');

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
];

const configureCors = () => {
  const allowedOriginEnv = process.env.ALLOWED_ORIGIN;
  const configuredOrigins = allowedOriginEnv
    ? allowedOriginEnv.split(',').map((origin) => origin.trim())
    : [];

  const allowedOrigins = [...new Set([...defaultDevOrigins, ...configuredOrigins])];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server requests)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(`CORS policy violation: Origin '${origin}' is not allowed.`);
      error.status = 403;
      return callback(error, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  });
};

module.exports = configureCors;
