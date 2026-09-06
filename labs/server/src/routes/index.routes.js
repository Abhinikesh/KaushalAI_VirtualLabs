const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    service: 'kaushalai-labs-backend',
    name: 'KaushalAI Virtual Labs API',
    description: 'Interactive coding lab sandbox backend service',
    status: 'online',
    version: '1.0.0',
    documentation: '/health'
  });
});

module.exports = router;
