const jwt = require('jsonwebtoken');

/**
 * Middleware: verifyLabAccessToken
 * Validates short-lived SSO JWT tokens issued by the main KaushalAI platform backend.
 * Token can arrive via:
 *   1. Authorization header: "Bearer <token>" (standard on subsequent API calls)
 *   2. Query parameter: "?token=<token>" (on initial redirect/handoff from course page)
 */
const verifyLabAccessToken = (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Check query parameter fallback
  if (!token && req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'TOKEN_MISSING',
      message: 'Access Denied — No lab access token provided. Please launch this lab from the KaushalAI course page.'
    });
  }

  const secret = process.env.JWT_SHARED_SECRET || 'kaushalai_virtual_labs_secure_jwt_shared_secret_2026_x89a';

  try {
    const decoded = jwt.verify(token, secret);

    // Validate required claims in payload
    if (!decoded.user_id || !decoded.lab_id) {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'TOKEN_MALFORMED',
        message: 'Invalid lab access token payload — required identifiers missing.'
      });
    }

    // Attach verified session claims to request for downstream controllers
    req.labAccess = {
      user_id: decoded.user_id,
      course_id: decoded.course_id,
      lab_id: decoded.lab_id,
      user_name: decoded.user_name || 'Learner',
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (err) {
    // Never log raw token value
    console.warn(`[verifyLabAccessToken] Verification failed: ${err.message}`);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        code: 'TOKEN_EXPIRED',
        message: 'Your lab session has expired — please return to the course page and click Start Lab again.'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      code: 'TOKEN_INVALID',
      message: 'Invalid or forged lab access token — verification failed.'
    });
  }
};

module.exports = verifyLabAccessToken;
