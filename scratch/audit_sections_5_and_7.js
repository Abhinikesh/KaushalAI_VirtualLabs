const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'labs/server/.env' });

const JWT_SECRET = process.env.JWT_SHARED_SECRET;
const WEBHOOK_SECRET = process.env.LABS_WEBHOOK_SECRET;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const SERVER_URL = 'http://localhost:5001';

async function runAudit() {
  console.log('========================================================');
  console.log('AUDIT: SECTION 5 (COMPLETION + WEBHOOK) & SECTION 7 (SECURITY)');
  console.log('========================================================\n');

  // Connect to MongoDB to inspect documents directly
  await mongoose.connect(process.env.MONGODB_URI);
  const LabAttempt = mongoose.connection.collection('lab_attempts');

  // Setup Mock Main App on port 5000 for webhook testing
  let webhookReceived = [];
  const mockMainServer = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/labs/webhook/completion') {
      const secret = req.headers['x-labs-webhook-secret'];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        if (secret !== WEBHOOK_SECRET) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized secret' }));
        }
        try {
          const payload = JSON.parse(body);
          webhookReceived.push(payload);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok', matched: true, progress_updated: true }));
        } catch (e) {
          res.writeHead(400);
          res.end();
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise(r => mockMainServer.listen(5000, r));
  console.log('✓ Mock Main Platform Server listening on port 5000 for webhooks.\n');

  // ----------------------------------------------------
  // SECTION 5: COMPLETION + WEBHOOK PIPELINE
  // ----------------------------------------------------
  console.log('--- SECTION 5: COMPLETION & WEBHOOK PIPELINE ---');

  // Generate tokens for two different lab types
  const tokenLab1 = jwt.sign(
    { user_id: 'learner_audit_1', user_name: 'Audit User 1', lab_id: 'lab-python-basics', course_context: 'Python Analytics 101' },
    JWT_SECRET,
    { expiresIn: '5m' }
  );
  const tokenLab2 = jwt.sign(
    { user_id: 'learner_audit_2', user_name: 'Audit User 2', lab_id: 'lab-sheet-payroll', course_context: 'Office Productivity 202' },
    JWT_SECRET,
    { expiresIn: '5m' }
  );

  // 1. Lab 1 (Python): Start Attempt
  const startRes1 = await fetch(`${SERVER_URL}/api/lab-attempts/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenLab1}`, 'Content-Type': 'application/json' }
  });
  const startData1 = await startRes1.json();
  const attemptId1 = startData1.attempt?._id;
  console.log(`✓ Lab 1 (Python) attempt started: ID ${attemptId1}`);

  // 2. Lab 1: Complete Attempt
  const completeRes1 = await fetch(`${SERVER_URL}/api/lab-attempts/${attemptId1}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenLab1}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      final_code: 'total = sum(salaries)',
      tasks_completed: ['task-py-1', 'task-py-2'],
      score: 100
    })
  });
  const completeData1 = await completeRes1.json();
  console.log(`✓ Lab 1 (Python) attempt completed: status=${completeRes1.status}, attemptStatus=${completeData1.attempt?.status}`);

  // 3. Lab 2 (Spreadsheet): Start and Complete Attempt
  const startRes2 = await fetch(`${SERVER_URL}/api/lab-attempts/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenLab2}`, 'Content-Type': 'application/json' }
  });
  const startData2 = await startRes2.json();
  const attemptId2 = startData2.attempt?._id;
  console.log(`✓ Lab 2 (Spreadsheet) attempt started: ID ${attemptId2}`);

  const completeRes2 = await fetch(`${SERVER_URL}/api/lab-attempts/${attemptId2}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenLab2}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      final_code: JSON.stringify({ sheetData: [['Total', '=SUM(C2:C5)']] }),
      tasks_completed: ['task-sheet-sum', 'task-sheet-avg'],
      score: 100
    })
  });
  const completeData2 = await completeRes2.json();
  console.log(`✓ Lab 2 (Spreadsheet) attempt completed: status=${completeRes2.status}, attemptStatus=${completeData2.attempt?.status}`);

  // Wait a moment for async webhook dispatch
  await new Promise(r => setTimeout(r, 600));

  // Verify MongoDB document state
  const doc1 = await LabAttempt.findOne({ _id: new mongoose.Types.ObjectId(attemptId1) });
  console.log('\n[MongoDB Verification]:');
  console.log(`  Lab 1 doc: user_id=${doc1.user_id}, status=${doc1.status}, score=${doc1.score}, tasks=${doc1.tasks_completed?.length}, completed_at=${doc1.completed_at}`);
  if (doc1 && doc1.status === 'completed' && doc1.score === 100 && doc1.final_code === 'total = sum(salaries)') {
    console.log('  ✓ PASS: LabAttempt record properly created and updated in MongoDB.');
  } else {
    console.error('  ✗ FAIL: LabAttempt doc does not match expected fields.');
  }

  // Verify Webhook payloads
  console.log('\n[Webhook Verification]:');
  console.log(`  Total webhooks received on mock server: ${webhookReceived.length}`);
  webhookReceived.forEach((wh, idx) => {
    console.log(`  Webhook ${idx + 1}: user_id=${wh.user_id}, lab_id=${wh.lab_id}, course_context=${wh.course_context}, score=${wh.score}`);
  });
  if (webhookReceived.length >= 2) {
    console.log('  ✓ PASS: Server-to-server webhook fired and delivered with valid signature.');
  } else {
    console.error('  ✗ FAIL: Expected at least 2 webhooks.');
  }

  // Idempotency: Complete Lab 1 a SECOND time with the same attempt ID
  console.log('\n[Idempotency Check]: Calling completeLabAttempt a second time with attemptId1...');
  const completeRes1Retry = await fetch(`${SERVER_URL}/api/lab-attempts/${attemptId1}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenLab1}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      final_code: 'total = sum(salaries)',
      tasks_completed: ['task-py-1', 'task-py-2'],
      score: 100
    })
  });
  const completeData1Retry = await completeRes1Retry.json();
  console.log(`  Retry status: ${completeRes1Retry.status}, attempt status: ${completeData1Retry.attempt?.status}`);
  const allAttemptsForUser1 = await LabAttempt.find({ user_id: 'learner_audit_1' }).toArray();
  console.log(`  Total attempts in MongoDB for learner_audit_1: ${allAttemptsForUser1.length}`);
  if (completeRes1Retry.status === 200 && allAttemptsForUser1.length === 1) {
    console.log('  ✓ PASS: Idempotent retry succeeded without creating duplicate documents or erroring.');
  } else {
    console.error('  ✗ FAIL: Retry created duplicates or returned error.');
  }

  // ----------------------------------------------------
  // SECTION 7: SECURITY SPOT-CHECKS
  // ----------------------------------------------------
  console.log('\n--- SECTION 7: SECURITY SPOT-CHECKS ---');

  // Check 1: User Isolation (User A tries to modify User B's attempt)
  console.log('\n[Security Check 1]: User Isolation');
  const crossUserRes = await fetch(`${SERVER_URL}/api/lab-attempts/${attemptId1}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenLab2}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ score: 50 })
  });
  const crossUserData = await crossUserRes.json();
  console.log(`  Cross-user access response: HTTP ${crossUserRes.status}`, crossUserData);
  if (crossUserRes.status === 403) {
    console.log('  ✓ PASS: Cross-user attempt tampering correctly blocked with 403 Forbidden.');
  } else {
    console.error(`  ✗ FAIL: Expected 403 Forbidden, got ${crossUserRes.status}`);
  }

  // Check 2: Admin Endpoints Authentication
  console.log('\n[Security Check 2]: Admin Endpoints Key Protection');
  const adminNoKeyRes = await fetch(`${SERVER_URL}/api/admin/labs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Rogue Lab' })
  });
  console.log(`  Admin request without X-Admin-Key: HTTP ${adminNoKeyRes.status}`);

  const adminBadKeyRes = await fetch(`${SERVER_URL}/api/admin/labs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': 'bad-fake-key' },
    body: JSON.stringify({ title: 'Rogue Lab' })
  });
  console.log(`  Admin request with bad X-Admin-Key: HTTP ${adminBadKeyRes.status}`);

  const adminGoodKeyRes = await fetch(`${SERVER_URL}/api/admin/labs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_API_KEY },
    body: JSON.stringify({
      lab_id: 'test-admin-lab-temp',
      title: 'Temporary Admin Audit Lab',
      type: 'python_sandbox',
      description: 'Audit lab for admin verification',
      difficulty: 'Beginner',
      estimated_minutes: 10,
      config: { starter_code: '# test', instructions: 'Instructions', tasks: [] }
    })
  });
  console.log(`  Admin request with valid X-Admin-Key: HTTP ${adminGoodKeyRes.status}`);
  if (adminNoKeyRes.status === 401 && adminBadKeyRes.status === 401 && (adminGoodKeyRes.status === 201 || adminGoodKeyRes.status === 200)) {
    console.log('  ✓ PASS: Admin endpoints strictly enforce X-Admin-Key.');
    // clean up test lab
    await mongoose.connection.collection('labs').deleteOne({ lab_id: 'test-admin-lab-temp' });
  } else {
    console.error('  ✗ FAIL: Admin key verification did not behave as expected.');
  }

  // Check 3: Rate Limiting
  console.log('\n[Security Check 3]: Rate Limiting Header Inspection');
  const checkRateLimitRes = await fetch(`${SERVER_URL}/api/lab-attempts/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenLab1}`, 'Content-Type': 'application/json' }
  });
  const limit = checkRateLimitRes.headers.get('ratelimit-limit');
  const remaining = checkRateLimitRes.headers.get('ratelimit-remaining');
  const reset = checkRateLimitRes.headers.get('ratelimit-reset');
  console.log(`  RateLimit headers present: Limit=${limit}, Remaining=${remaining}, Reset=${reset}s`);
  if (limit) {
    console.log('  ✓ PASS: Rate limiting headers are actively returned on write endpoints.');
  } else {
    console.log('  ⚠️ WARNING: RateLimit headers not detected on endpoint.');
  }

  // Clean up
  await LabAttempt.deleteMany({ user_id: { $in: ['learner_audit_1', 'learner_audit_2'] } });
  await mongoose.disconnect();
  mockMainServer.close();
  console.log('\nAudit test completed and resources cleaned up.');
}

runAudit().catch(err => {
  console.error('Fatal in audit script:', err);
  process.exit(1);
});
