require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Utility to generate an authentic 5-minute signed lab access token
 * Usage: node src/scripts/generateLabToken.js [lab_id] [user_id] [user_name] [course_context]
 */
function generateToken({
  lab_id = 'lab-python-basics',
  user_id = 'user_6a9716b23a22',
  user_name = 'Priya Nair (Statistical Officer)',
  course_context = 'Official Statistical Computing & Survey Analysis'
} = {}) {
  const secret = process.env.JWT_SHARED_SECRET || 'e345add7dd9b19f8e8c0d6005b66fb2f02283fadf60d48109c18c27a4c752da65ecb224d6ee55edcd3dfc4138197b80c271738146deef3e3fe637554f679108f';
  const labsAppUrl = process.env.LABS_CLIENT_URL || 'http://localhost:5173';

  const payload = {
    user_id,
    user_name,
    lab_id,
    course_context
  };

  const token = jwt.sign(payload, secret, { expiresIn: '5m' });
  const redirect_url = `${labsAppUrl}/lab/${lab_id}?token=${token}`;

  return { token, redirect_url, payload };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const lab_id = args[0] || 'lab-python-basics';
  const user_id = args[1] || 'user_6a9716b23a22';
  const user_name = args[2] || 'Priya Nair (Statistical Officer)';
  const course_context = args[3] || 'Official Statistical Computing';

  const result = generateToken({ lab_id, user_id, user_name, course_context });
  console.log('\n=== KaushalAI Virtual Labs Test Handoff Token (5 min) ===');
  console.log('User ID:       ', result.payload.user_id);
  console.log('User Name:     ', result.payload.user_name);
  console.log('Lab ID:        ', result.payload.lab_id);
  console.log('Course Context:', result.payload.course_context);
  console.log('Expires:        In 5 minutes (300s)');
  console.log('Token:         ', result.token);
  console.log('Redirect URL:  ', result.redirect_url);
  console.log('========================================================\n');
}

module.exports = { generateToken };
