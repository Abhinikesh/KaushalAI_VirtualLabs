/**
 * Middleware: verifyAdminKey
 * Validates internal API key for lab catalog administration.
 * Header: X-Admin-Key
 */
const verifyAdminKey = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('[Admin Auth Error] ADMIN_API_KEY is not configured in server environment.');
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Admin authorization configuration error.'
    });
  }

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing X-Admin-Key header.'
    });
  }

  next();
};

module.exports = verifyAdminKey;
