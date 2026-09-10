/**
 * Regex Sandbox Part 1: Data Model & Content Verification Suite
 */

const BASE_URL = 'http://localhost:5001';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(message);
  }
  passed++;
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('  REGEX SANDBOX PART 1: DATA MODEL & CONTENT VERIFICATION');
  console.log('===============================================================\n');

  // 1. Catalog Check
  console.log('--- Step 1: Catalog API Check ---');
  const catRes = await fetch(`${BASE_URL}/api/labs`);
  assert(catRes.status === 200, 'Catalog API returned 200 OK');
  const catData = await catRes.json();
  const allLabs = catData.labs || [];
  assert(allLabs.length === 18, `Total labs in catalog equals 18 (got: ${allLabs.length})`);

  const regexLabs = allLabs.filter((l) => l.type === 'regex_sandbox');
  assert(regexLabs.length === 3, `Found 3 regex_sandbox labs in catalog (got: ${regexLabs.length})`);

  const expectedLabIds = [
    'lab-regex-extract-employee-ids',
    'lab-regex-validate-gov-emails',
    'lab-regex-clean-phone-numbers'
  ];
  for (const id of expectedLabIds) {
    const found = regexLabs.find((l) => l.lab_id === id);
    assert(!!found, `Found lab ${id} in catalog list`);
  }

  // 2. Details & Config Shape Verification
  console.log('\n--- Step 2: Details & Config Projection Check ---');
  
  // 2a. Employee IDs Lab
  const res1 = await fetch(`${BASE_URL}/api/labs/lab-regex-extract-employee-ids`);
  assert(res1.status === 200, 'Lab 1 returned 200 OK');
  const lab1 = (await res1.json()).lab;
  assert(lab1.type === 'regex_sandbox', 'Lab 1 type is regex_sandbox');
  assert(lab1.config.mode === 'regex_match', 'Lab 1 mode is regex_match');
  assert(typeof lab1.config.sample_text === 'string' && lab1.config.sample_text.length > 50, 'Lab 1 sample_text is non-empty');
  assert(lab1.competency_tags.includes('Data Entry & Validation'), 'Lab 1 tagged with Data Entry & Validation');
  assert(lab1.competency_tags.includes('Document Handling'), 'Lab 1 tagged with Document Handling');
  assert(lab1.config.tasks.length === 3, 'Lab 1 has 3 tasks');
  assert(lab1.config.tasks[0].validation_type === 'regex_matches_all', 'Lab 1 task 0 is regex_matches_all');
  assert(lab1.config.tasks[1].validation_type === 'regex_matches_none', 'Lab 1 task 1 is regex_matches_none');
  assert(lab1.config.tasks[2].validation_type === 'regex_match_count_equals', 'Lab 1 task 2 is regex_match_count_equals');

  // 2b. Gov Emails Lab
  const res2 = await fetch(`${BASE_URL}/api/labs/lab-regex-validate-gov-emails`);
  assert(res2.status === 200, 'Lab 2 returned 200 OK');
  const lab2 = (await res2.json()).lab;
  assert(lab2.type === 'regex_sandbox', 'Lab 2 type is regex_sandbox');
  assert(lab2.config.mode === 'regex_match', 'Lab 2 mode is regex_match');
  assert(typeof lab2.config.sample_text === 'string' && lab2.config.sample_text.length > 50, 'Lab 2 sample_text is non-empty');
  assert(lab2.competency_tags.includes('Data Entry & Validation'), 'Lab 2 tagged with Data Entry & Validation');
  assert(lab2.config.tasks.length === 3, 'Lab 2 has 3 tasks');

  // 2c. Phone Numbers Lab
  const res3 = await fetch(`${BASE_URL}/api/labs/lab-regex-clean-phone-numbers`);
  assert(res3.status === 200, 'Lab 3 returned 200 OK');
  const lab3 = (await res3.json()).lab;
  assert(lab3.type === 'regex_sandbox', 'Lab 3 type is regex_sandbox');
  assert(lab3.config.mode === 'transform', 'Lab 3 mode is transform');
  assert(typeof lab3.config.sample_text === 'string' && lab3.config.sample_text.length > 50, 'Lab 3 sample_text is non-empty');
  assert(lab3.competency_tags.includes('Data Entry & Validation'), 'Lab 3 tagged with Data Entry & Validation');
  assert(lab3.config.tasks.length === 2, 'Lab 3 has 2 tasks');
  assert(lab3.config.tasks[0].validation_type === 'transform_output_equals', 'Lab 3 task 0 is transform_output_equals');

  // 3. Solution Verification against Seed Data
  console.log('\n--- Step 3: Exact Solution Validation Against Configs ---');

  // Test Lab 1 Solution
  const pattern1 = /\bISS-\d{4}-\d{4}\b/g;
  const matches1 = lab1.config.sample_text.match(pattern1) || [];
  const expected1 = lab1.config.tasks[0].validation_config.expected_matches;
  const disallowed1 = lab1.config.tasks[1].validation_config.disallowed_matches;
  const expectedCount1 = lab1.config.tasks[2].validation_config.expected_count;
  assert(expected1.every(m => matches1.includes(m)), 'Lab 1 regex matches all expected cadre IDs');
  assert(disallowed1.every(m => !matches1.includes(m)), 'Lab 1 regex rejects all invalid IDs');
  assert(matches1.length === expectedCount1, `Lab 1 regex match count equals ${expectedCount1}`);

  // Test Lab 2 Solution
  const pattern2 = /\b[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*(?:gov|nic)\.in\b/g;
  const matches2 = lab2.config.sample_text.match(pattern2) || [];
  const expected2 = lab2.config.tasks[0].validation_config.expected_matches;
  const disallowed2 = lab2.config.tasks[1].validation_config.disallowed_matches;
  const expectedCount2 = lab2.config.tasks[2].validation_config.expected_count;
  assert(expected2.every(m => matches2.includes(m)), 'Lab 2 regex matches all official government emails');
  assert(disallowed2.every(m => !matches2.includes(m)), 'Lab 2 regex rejects malformed email submissions');
  assert(matches2.length === expectedCount2, `Lab 2 regex match count equals ${expectedCount2}`);

  // Test Lab 3 Solution
  const sample3 = lab3.config.sample_text;
  const transformed3 = sample3.replace(/(?:\+91[\s-]?)?(?:0)?(\d{5})[\s-]?(\d{5})/g, '+91-$1$2');
  const expectedOutput3 = lab3.config.tasks[0].validation_config.expected_output;
  assert(transformed3 === expectedOutput3, 'Lab 3 JavaScript transform matches expected output exactly');

  console.log('\n===============================================================');
  console.log(`  ALL CHECKS PASSED: ${passed}/${total}`);
  console.log('  Regex Sandbox Part 1 Verified Successfully!');
  console.log('===============================================================\n');
}

runTests().catch((err) => {
  console.error('\nTest Suite Error:', err.message);
  process.exit(1);
});
