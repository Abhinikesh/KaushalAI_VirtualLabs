require('dotenv').config();
const http = require('http');
const { dispatchMainAppWebhook } = require('../controllers/labs.controller');

/**
 * Standalone test suite verifying server-to-server webhook dispatch & reception
 */
async function runWebhookTests() {
  console.log('\n=== Testing Virtual Labs Server-to-Server Webhook Flow ===\n');

  const EXPECTED_SECRET = process.env.LABS_WEBHOOK_SECRET || '02097ff73adcb64ee969157a570f206b4b0238f1090b5ea56ecbc5d2a1d5cf0053f4ac1bfe98380fc155d2fac2eeb5cacc06149e0b3205cb922c2500f9bcf18c';
  let receivedPayloads = [];
  let unauthorizedAttempts = 0;

  // 1. Spin up mock Main Website backend server on port 5000
  const mockMainServer = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/labs/webhook/completion') {
      const secretHeader = req.headers['x-labs-webhook-secret'];

      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        if (!secretHeader || secretHeader !== EXPECTED_SECRET) {
          unauthorizedAttempts++;
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing secret' }));
          return;
        }

        try {
          const parsed = JSON.parse(body);
          receivedPayloads.push(parsed);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'ok',
            matched: true,
            user_id: parsed.user_id,
            lab_id: parsed.lab_id,
            message: 'Mock main platform recorded completion'
          }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'BadRequest' }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise((resolve) => mockMainServer.listen(5000, resolve));
  console.log('[Test Harness] Mock Main Platform Backend listening on http://localhost:5000');

  // Test Case 1: Valid webhook dispatch
  console.log('\n[Test 1] Dispatching valid lab completion webhook...');
  await dispatchMainAppWebhook({
    user_id: 'learner_test_401',
    lab_id: 'lab-python-basics',
    course_context: 'Official Statistical Computing',
    score: 100,
    completed_at: new Date().toISOString()
  });

  if (receivedPayloads.length === 1 && receivedPayloads[0].user_id === 'learner_test_401') {
    console.log('✓ Test 1 Passed: Mock main app received valid webhook with authenticated secret.');
    console.log('  Payload verified:', receivedPayloads[0]);
  } else {
    console.error('✗ Test 1 Failed: Webhook was not received by mock receiver.');
    process.exit(1);
  }

  // Test Case 2: Unauthorized request with invalid secret
  console.log('\n[Test 2] Testing unauthorized request with invalid secret...');
  const unauthorizedRes = await fetch('http://localhost:5000/api/labs/webhook/completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Labs-Webhook-Secret': 'wrong-or-tampered-secret'
    },
    body: JSON.stringify({ user_id: 'intruder', lab_id: 'lab-1' })
  });

  if (unauthorizedRes.status === 401) {
    console.log('✓ Test 2 Passed: Mock main app rejected invalid secret with HTTP 401 Unauthorized.');
  } else {
    console.error(`✗ Test 2 Failed: Expected 401, got ${unauthorizedRes.status}`);
  }

  // Test Case 3: Offline main app resilience
  console.log('\n[Test 3] Testing resilience when main platform is offline...');
  mockMainServer.close();
  console.log('[Test Harness] Closed mock server.');

  // This call should not throw or crash
  await dispatchMainAppWebhook({
    user_id: 'learner_offline_test',
    lab_id: 'lab-sql-employees',
    course_context: 'SQL Administration',
    score: 100,
    completed_at: new Date().toISOString()
  });
  console.log('✓ Test 3 Passed: Caller handled offline main app gracefully without crashing.');

  console.log('\n=== All Server-to-Server Webhook Tests Completed Successfully ===\n');
  process.exit(0);
}

if (require.main === module) {
  runWebhookTests().catch((err) => {
    console.error('Fatal error in webhook test suite:', err);
    process.exit(1);
  });
}

module.exports = { runWebhookTests };
