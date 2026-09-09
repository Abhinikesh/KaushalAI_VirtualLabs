const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for write endpoints (attempt creation and completion)
 * 20 requests per 15 minutes per IP
 */
const attemptWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many lab attempt requests from this IP address, please try again after 15 minutes.'
  }
});

/**
 * Rate limiter for public read endpoints (catalog listing & details)
 * 100 requests per 15 minutes per IP
 */
const catalogReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many catalog requests from this IP address, please try again after 15 minutes.'
  }
});

/**
 * Rate limiter for admin management endpoints
 * 60 requests per 15 minutes per IP
 */
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many admin requests from this IP address, please try again after 15 minutes.'
  }
});

module.exports = {
  attemptWriteLimiter,
  catalogReadLimiter,
  adminRateLimiter
};
