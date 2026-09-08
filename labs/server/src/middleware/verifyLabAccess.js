const jwt = require('jsonwebtoken');

/**
 * Middleware: verifyLabAccess
 * Validates short-lived SSO JWT tokens issued by the main KaushalAI platform backend.
 * Reads Authorization: Bearer <token> header.
 *
 * Payload claims expected:
 *   - user_id: string
 *   - user_name: string
 *   - lab_id: string
 *   - course_context: string (optional)
 *   - iat, exp
 */
const verifyLabAccess = (req, res, next) => {
  let token = null;

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Query param fallback for direct verification if needed
  if (!token && req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'TOKEN_MISSING',
      message: 'Your lab session has expired — please return to KaushalAI and launch this lab again'
    });
  }

  const secret = process.env.JWT_SHARED_SECRET;
  if (!secret) {
    console.error('[verifyLabAccess] JWT_SHARED_SECRET is not configured in environment.');
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Server authentication configuration error.'
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    // Validate required claims
    if (!decoded.user_id || !decoded.lab_id) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'TOKEN_MALFORMED',
        message: 'Your lab session has expired — please return to KaushalAI and launch this lab again'
      });
    }

    // Attach decoded session info to req.labAccess
    req.labAccess = {
      user_id: String(decoded.user_id),
      user_name: String(decoded.user_name || 'Learner'),
      lab_id: String(decoded.lab_id),
      course_context: String(decoded.course_context || decoded.course_id || ''),
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (err) {
    // CRITICAL: Never log raw token values in console output
    console.warn(`[verifyLabAccess] Token verification failed: ${err.name} - ${err.message}`);

    return res.status(401).json({
      error: 'Unauthorized',
      code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      message: 'Your lab session has expired — please return to KaushalAI and launch this lab again'
    });
  }
};

module.exports = verifyLabAccess;
