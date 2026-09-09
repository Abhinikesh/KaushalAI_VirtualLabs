require('dotenv').config();
const mongoose = require('mongoose');
const Lab = require('../models/Lab');

const initialLabs = [
  {
    lab_id: 'lab-python-basics',
    title: 'Clean Official Statistical Microdata with Pandas',
    description: 'Inspect district survey records, eliminate duplicate entries, drop missing values, and calculate summary literacy metrics using Pandas.',
    type: 'python_sandbox',
    course_title: 'Official Statistical Computing & Survey Analysis',
    competency_tags: ['Python Data Manipulation', 'Microdata Cleaning', 'Statistical Aggregation'],
    is_active: true,
    config: {
      expected_packages: ['pandas'],
      instructions: `### Lab Objective: Microdata Cleansing & Validation

In official statistics, raw administrative survey feeds often contain duplicate records and incomplete measurements. In this hands-on lab, you will use **Pandas** to clean a simulated district development dataset.

#### Instructions:
1. **Remove Duplicate Rows**: Inspect the DataFrame created from \`raw_survey_data\` and remove duplicate rows using \`df.drop_duplicates()\`. Store the resulting row count in variable \`cleaned_row_count\`.
2. **Handle Missing Values**: Drop rows where \`population\` is missing (\`NaN\` / \`None\`) using \`df.dropna(subset=['population'])\`. Store the remaining count in \`valid_districts_count\`.
3. **Compute Metric**: Calculate the mean literacy rate across the cleaned records and assign it to \`average_literacy\`.
4. **Print Summary**: Print the final report line containing the text \`[CLEANED_DATASET_SUMMARY]\` followed by your findings.`,
      starter_code: `import pandas as pd

# Raw simulated district survey data (contains duplicates and missing records)
raw_survey_data = [
    {"district_id": "D01", "district": "Varanasi", "population": 3676841, "literacy_rate": 75.6},
    {"district_id": "D02", "district": "Kanpur", "population": 4581268, "literacy_rate": 79.7},
    {"district_id": "D03", "district": "Prayagraj", "population": None, "literacy_rate": 72.3},
    {"district_id": "D01", "district": "Varanasi", "population": 3676841, "literacy_rate": 75.6}, # duplicate
    {"district_id": "D04", "district": "Lucknow", "population": 4589838, "literacy_rate": 82.5},
    {"district_id": "D05", "district": "Agra", "population": 4418797, "literacy_rate": 92.2},
]

# Step 1: Create initial DataFrame
df = pd.DataFrame(raw_survey_data)
print("Initial records count:", len(df))

# TODO 1: Remove duplicates and set cleaned_row_count
# df = df.drop_duplicates(...)
cleaned_row_count = len(df)

# TODO 2: Drop missing population rows and set valid_districts_count
# df = df.dropna(...)
valid_districts_count = len(df)

# TODO 3: Compute average literacy rate of cleaned records
average_literacy = 0.0

# TODO 4: Print summary report with '[CLEANED_DATASET_SUMMARY]' tag
print("Processing complete.")
`,
      tasks: [
        {
          id: 'task_dedup',
          description: 'Deduplicate rows: variable cleaned_row_count equals 5',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'cleaned_row_count',
            expected: 5
          }
        },
        {
          id: 'task_missing',
          description: 'Drop records with missing population: valid_districts_count equals 4',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'valid_districts_count',
            expected: 4
          }
        },
        {
          id: 'task_avg',
          description: 'Compute mean literacy rate into average_literacy (~82.5%)',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'average_literacy',
            expected: 82.5,
            tolerance: 0.2
          }
        },
        {
          id: 'task_print',
          description: 'Print summary message containing [CLEANED_DATASET_SUMMARY]',
          validation_type: 'output_contains',
          validation_config: {
            substring: '[CLEANED_DATASET_SUMMARY]'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-python-analytics',
    title: 'Statistical Indicator Estimation & Weighted Sampling',
    description: 'Implement a weighted mean aggregation function to calculate complex survey indicators with sample weight adjustments.',
    type: 'python_sandbox',
    course_title: 'Survey Methodology & Sample Estimation',
    competency_tags: ['Sample Weights', 'Python Estimation', 'Statistical Modeling'],
    is_active: true,
    config: {
      expected_packages: [],
      instructions: `### Lab Objective: Weighted Mean Estimation

In official sample surveys, observations carry varying probability weights.

#### Tasks:
1. Define a function \`calculate_weighted_mean(values, weights)\` that returns \`sum(v * w for v, w in zip(values, weights)) / sum(weights)\`.
2. Compute the weighted estimate for the provided sample vector and print a line containing \`Weighted mean:\`.`,
      starter_code: `# Implement the official sample weight adjustment function
def calculate_weighted_mean(values, weights):
    # TODO: Calculate and return sum(v*w) / sum(w)
    pass

sample_values = [12, 18, 24, 30]
sample_weights = [1.0, 2.5, 3.0, 1.5]

result = calculate_weighted_mean(sample_values, sample_weights)
print("Result computed:", result)
`,
      tasks: [
        {
          id: 'task_func',
          description: 'Function calculate_weighted_mean returns correct weighted mean',
          validation_type: 'function_returns',
          validation_config: {
            function: 'calculate_weighted_mean',
            test_cases: [
              { args: [[10, 20, 30], [1, 2, 1]], expected: 20 },
              { args: [[50, 100], [2, 3]], expected: 80 }
            ]
          }
        },
        {
          id: 'task_print_weighted',
          description: 'Print formatted output containing "Weighted mean:"',
          validation_type: 'output_contains',
          validation_config: {
            substring: 'Weighted mean:'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-sql-employees',
    title: 'Government Personnel Records & Department Queries',
    description: 'Filter, project, and aggregate civil service employee records across government departments using SQLite in WebAssembly.',
    type: 'sql_sandbox',
    course_title: 'Public Administration Database Systems',
    competency_tags: ['SQL Data Extraction', 'Cadre Record Management', 'Relational Filtering'],
    is_active: true,
    config: {
      schema_sql: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  salary INTEGER NOT NULL,
  join_date TEXT NOT NULL
);

INSERT INTO employees VALUES (1, 'Priya Nair', 'Statistics', 'Senior Statistical Officer', 82000, '2021-04-15');
INSERT INTO employees VALUES (2, 'Rajesh Sharma', 'Economics', 'Joint Director', 95000, '2018-09-01');
INSERT INTO employees VALUES (3, 'Anita Verma', 'Statistics', 'Assistant Director', 74000, '2022-01-10');
INSERT INTO employees VALUES (4, 'Amitabh Das', 'Administration', 'Section Officer', 68000, '2020-07-20');
INSERT INTO employees VALUES (5, 'Sneha Mukherjee', 'Finance', 'Accounts Officer', 71000, '2021-11-05');
INSERT INTO employees VALUES (6, 'Vikram Malhotra', 'Statistics', 'Data Analyst', 64000, '2023-03-12');
INSERT INTO employees VALUES (7, 'Sunita Rao', 'Economics', 'Senior Research Officer', 88000, '2019-06-18');
INSERT INTO employees VALUES (8, 'Manoj Kumar', 'Statistics', 'Statistical Officer', 69000, '2022-08-25');
INSERT INTO employees VALUES (9, 'Deepa Joshi', 'Finance', 'Senior Accounts Officer', 79000, '2020-02-14');
INSERT INTO employees VALUES (10, 'Sanjay Patel', 'Administration', 'Under Secretary', 92000, '2017-12-01');`,
      starter_query: `-- Write your SQL query below
SELECT * FROM employees;`,
      instructions: `### Lab Objective: Relational Data Querying & Filtering

In government department administration, database queries are essential for generating staffing rosters, payroll breakdowns, and official cadre audits.

#### Schema Reference:
The database contains an \`employees\` table:
- \`id\` (INTEGER): Unique employee badge ID
- \`name\` (TEXT): Employee full name
- \`department\` (TEXT): Ministry department name ('Statistics', 'Economics', 'Finance', 'Administration')
- \`designation\` (TEXT): Official cadre designation
- \`salary\` (INTEGER): Monthly basic pay in INR
- \`join_date\` (TEXT): Joining date in ISO format ('YYYY-MM-DD')

#### Tasks to Complete:
1. **Filter Department Records**: Write a query selecting all employees in the 'Statistics' department (\`WHERE department = 'Statistics'\`). The result must return exactly 4 rows.
2. **List Unique Departments**: Write a query listing distinct department names ordered alphabetically (\`SELECT DISTINCT department FROM employees ORDER BY department ASC\`).
3. **High-Earning Personnel**: Write a query to select the names of all employees whose salary is 80,000 or greater, ordered by salary descending (\`WHERE salary >= 80000 ORDER BY salary DESC\`).`,
      tasks: [
        {
          id: 'task_stats_dept',
          description: 'Filter all employees in the Statistics department (expected 4 rows)',
          validation_type: 'row_count_equals',
          validation_config: {
            expected_row_count: 4
          }
        },
        {
          id: 'task_distinct_depts',
          description: 'List distinct departments alphabetically: Administration, Economics, Finance, Statistics',
          validation_type: 'column_values_match',
          validation_config: {
            column: 'department',
            expected_values: ['Administration', 'Economics', 'Finance', 'Statistics'],
            strict_order: true
          }
        },
        {
          id: 'task_high_salary',
          description: 'List names of officers with salary >= 80000 ordered by salary DESC',
          validation_type: 'column_values_match',
          validation_config: {
            column: 'name',
            expected_values: ['Rajesh Sharma', 'Sanjay Patel', 'Sunita Rao', 'Priya Nair'],
            strict_order: true
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-sql-districts',
    title: 'District Survey Statistics & Population Analysis',
    description: 'Perform GROUP BY aggregations and computing summary statistics across administrative divisions.',
    type: 'sql_sandbox',
    course_title: 'Census & Demographics',
    competency_tags: ['Demographic Projections', 'SQL Aggregations', 'Survey Grouping'],
    is_active: true,
    config: {
      schema_sql: `CREATE TABLE districts (
  district_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  population INTEGER NOT NULL,
  literacy_rate REAL NOT NULL
);

INSERT INTO districts VALUES ('D01', 'Varanasi', 'Eastern', 3676841, 75.6);
INSERT INTO districts VALUES ('D02', 'Kanpur', 'Central', 4581268, 79.7);
INSERT INTO districts VALUES ('D03', 'Prayagraj', 'Eastern', 5954391, 72.3);
INSERT INTO districts VALUES ('D04', 'Lucknow', 'Central', 4589838, 82.5);
INSERT INTO districts VALUES ('D05', 'Agra', 'Western', 4418797, 92.2);
INSERT INTO districts VALUES ('D06', 'Meerut', 'Western', 3443689, 72.8);`,
      starter_query: `-- Calculate statistics by administrative division
SELECT division, COUNT(*) as district_count, AVG(literacy_rate) as avg_literacy
FROM districts
GROUP BY division;`,
      instructions: `### Lab Objective: Group Aggregations & Division Summaries

Learn to compute district-level aggregates per administrative division.

#### Tasks:
1. Select division and count of districts per division grouped by division. Result must return 3 rows.
2. Result contains the Eastern division summary.`,
      tasks: [
        {
          id: 'task_group_count',
          description: 'Group districts by division (returns exactly 3 division rows)',
          validation_type: 'row_count_equals',
          validation_config: {
            expected_row_count: 3
          }
        },
        {
          id: 'task_contains_eastern',
          description: 'Result set contains "Eastern" division summary',
          validation_type: 'result_contains',
          validation_config: {
            value: 'Eastern'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-js-arrays',
    title: 'Array Manipulation: Filtering, Reduction & Sorting',
    description: 'Process employee records using modern JavaScript array methods: filter by department, calculate total payroll with reduce, and sort by compensation.',
    type: 'js_sandbox',
    course_title: 'Modern JavaScript & Web Application Development',
    competency_tags: ['JavaScript Basics', 'Data Analysis', 'Array Methods', 'IT & Digital Skills'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: JavaScript Array Manipulation
Learn to process and transform structured collections of objects using standard JavaScript array methods (\`filter\`, \`reduce\`, and \`sort\`).

#### Tasks:
1. **Filter by Department**: Filter the \`employees\` array to include only records where \`department === "Finance"\`. Store the result in \`financeEmployees\`.
2. **Compute Total Salary**: Calculate the combined salary of all \`financeEmployees\` using \`.reduce()\`. Store the number in \`totalFinanceSalary\`.
3. **Sort by Salary**: Create a copy of the \`employees\` array sorted in descending order of salary (highest first). Store the result in \`sortedEmployees\`.
4. **Log Payroll Summary**: Output a summary containing \`[PAYROLL_SUMMARY]\` via \`console.log\`.`,
      starter_code: `// Employee records dataset
const employees = [
  { id: 1, name: "Aarav Sharma", department: "Engineering", salary: 85000 },
  { id: 2, name: "Priya Patel", department: "Finance", salary: 72000 },
  { id: 3, name: "Rohan Verma", department: "Marketing", salary: 58000 },
  { id: 4, name: "Ananya Iyer", department: "Finance", salary: 75000 },
  { id: 5, name: "Vikram Singh", department: "Engineering", salary: 92000 },
  { id: 6, name: "Neha Gupta", department: "Finance", salary: 68000 }
];

// TODO 1: Filter employees array to keep only those where department === "Finance"
const financeEmployees = []; // replace with employees.filter(...)

// TODO 2: Calculate the total salary of all financeEmployees using .reduce()
const totalFinanceSalary = 0; // replace with financeEmployees.reduce(...)

// TODO 3: Sort a copy of the employees array by salary descending (highest first)
const sortedEmployees = []; // replace with [...employees].sort(...)

// TODO 4: Print summary with the tag '[PAYROLL_SUMMARY]'
console.log(\`[PAYROLL_SUMMARY] Records processed: \${employees.length}\`);
`,
      tasks: [
        {
          id: 'task_filter_finance',
          description: 'Filter to Finance department: financeEmployees has 3 records',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'financeEmployees.length',
            expected: 3
          }
        },
        {
          id: 'task_total_payroll',
          description: 'Calculate total Finance payroll: totalFinanceSalary equals 215000',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'totalFinanceSalary',
            expected: 215000
          }
        },
        {
          id: 'task_sorted_top',
          description: 'Sort descending: highest earner is "Vikram Singh"',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'sortedEmployees[0].name',
            expected: 'Vikram Singh'
          }
        },
        {
          id: 'task_log_summary',
          description: 'Log payroll summary report containing "[PAYROLL_SUMMARY]"',
          validation_type: 'console_output_contains',
          validation_config: {
            expected: '[PAYROLL_SUMMARY]'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-js-strings',
    title: 'String Processing & Text Normalization',
    description: 'Clean noisy user feedback, normalize casing, tokenize sentences into word arrays, and count word frequencies.',
    type: 'js_sandbox',
    course_title: 'Modern JavaScript & Web Application Development',
    competency_tags: ['JavaScript Basics', 'Text Processing', 'IT & Digital Skills', 'String Manipulation'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: Text Cleaning & Normalization
Practice cleaning unformatted text input using JavaScript string manipulation methods (\`trim\`, \`toLowerCase\`, and \`split\`).

#### Tasks:
1. **Normalize Text**: Trim leading/trailing whitespace and convert \`rawFeedback\` to lowercase. Store the string in \`cleanedText\`.
2. **Tokenize Words**: Split \`cleanedText\` by spaces into an array of words stored in \`wordsArray\`.
3. **Word Count**: Calculate the length of \`wordsArray\` and assign it to \`wordCount\`.
4. **Keyword Detection**: Implement \`hasKeyword(text, keyword)\` returning true if the keyword exists in the text.
5. **Log Processing Summary**: Print a report containing \`[TEXT_PROCESSED_SUMMARY]\` via \`console.log\`.`,
      starter_code: `// Raw unformatted user feedback with extra whitespace and irregular casing
const rawFeedback = "   EXCELLENT platform with Interactive virtual LABS and Helpful mentors!   ";

// TODO 1: Trim leading/trailing whitespace and convert rawFeedback to lowercase
const cleanedText = ""; // replace with rawFeedback.trim().toLowerCase()

// TODO 2: Split cleanedText into an array of words (separated by space)
const wordsArray = []; // replace with cleanedText.split(/\\s+/)

// TODO 3: Count the total number of words in wordsArray
const wordCount = 0; // replace with wordsArray.length

// TODO 4: Write a helper function 'hasKeyword(text, keyword)' that returns true if text contains keyword (case-insensitive)
function hasKeyword(text, keyword) {
  // return boolean
  return false;
}

// TODO 5: Log processing summary report
console.log(\`[TEXT_PROCESSED_SUMMARY] Words counted: \${wordCount}\`);
`,
      tasks: [
        {
          id: 'task_clean_text',
          description: 'Trim and lowercase feedback: cleanedText starts with "excellent"',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'cleanedText',
            expected: 'excellent platform with interactive virtual labs and helpful mentors!'
          }
        },
        {
          id: 'task_word_count',
          description: 'Count words in tokenized array: wordCount equals 9',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'wordCount',
            expected: 9
          }
        },
        {
          id: 'task_function_keyword',
          description: 'hasKeyword("virtual labs", "labs") returns true',
          validation_type: 'function_returns',
          validation_config: {
            function_name: 'hasKeyword',
            args: ['virtual labs', 'labs'],
            expected: true
          }
        },
        {
          id: 'task_log_text_summary',
          description: 'Log text processing summary containing "[TEXT_PROCESSED_SUMMARY]"',
          validation_type: 'console_output_contains',
          validation_config: {
            expected: '[TEXT_PROCESSED_SUMMARY]'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-js-async-fetch',
    title: 'Async JavaScript: Simulated API & Promise Handling',
    description: 'Consume simulated asynchronous REST API endpoints using async/await, handle promises, and aggregate active user statistics.',
    type: 'js_sandbox',
    course_title: 'Modern JavaScript & Web Application Development',
    competency_tags: ['JavaScript Basics', 'Async JavaScript', 'API Integration', 'IT & Digital Skills'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: Asynchronous JavaScript & Promises
Learn how to work with asynchronous data using \`async\` and \`await\` to consume simulated REST API responses.

#### Tasks:
1. **Fetch & Filter Data**: In \`loadAndProcessUsers\`, await \`mockFetchUsers()\`, filter records where \`status === "active"\`, and return the array.
2. **Active User Count**: Assign the count of active users to \`activeUserCount\` (expected: 3).
3. **Aggregate Points**: Compute the sum of \`points\` across active users and store in \`totalActivePoints\` (expected: 1950).
4. **Log Summary**: Log completion line containing \`[ASYNC_FETCH_COMPLETE]\`.`,
      starter_code: `// Simulated API service (network delay simulated with Promise)
function mockFetchUsers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 101, username: "dev_karan", status: "active", points: 450 },
        { id: 102, username: "sarah_m", status: "inactive", points: 120 },
        { id: 103, username: "rahul_ai", status: "active", points: 890 },
        { id: 104, username: "tanya_c", status: "active", points: 610 },
        { id: 105, username: "amit_99", status: "pending", points: 50 }
      ]);
    }, 50);
  });
}

// Global variables to populate
let activeUsers = [];
let activeUserCount = 0;
let totalActivePoints = 0;

// TODO 1: Implement an async function to fetch users and filter active accounts
async function loadAndProcessUsers() {
  // 1. Await mockFetchUsers()
  // 2. Filter records where status === 'active' -> assign to activeUsers
  // 3. Set activeUserCount = activeUsers.length
  // 4. Calculate sum of points for active users -> assign to totalActivePoints
  // 5. Return activeUsers
  return [];
}

// Call the function
loadAndProcessUsers().then(() => {
  console.log(\`[ASYNC_FETCH_COMPLETE] Active users: \${activeUserCount}, Total points: \${totalActivePoints}\`);
});
`,
      tasks: [
        {
          id: 'task_async_fetch',
          description: 'loadAndProcessUsers returns array of 3 active users',
          validation_type: 'function_returns',
          validation_config: {
            function_name: 'loadAndProcessUsers',
            is_async: true,
            expected_length: 3
          }
        },
        {
          id: 'task_active_count',
          description: 'activeUserCount equals 3',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'activeUserCount',
            expected: 3
          }
        },
        {
          id: 'task_total_points',
          description: 'totalActivePoints equals 1950 (450 + 890 + 610)',
          validation_type: 'variable_equals',
          validation_config: {
            variable: 'totalActivePoints',
            expected: 1950
          }
        },
        {
          id: 'task_log_async_summary',
          description: 'Log summary containing "[ASYNC_FETCH_COMPLETE]"',
          validation_type: 'console_output_contains',
          validation_config: {
            expected: '[ASYNC_FETCH_COMPLETE]'
          }
        }
      ]
    }
  }
];

async function runSeed() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kaushalai_labs';
  console.log(`[Seed Script] Connecting to MongoDB: ${mongoURI}`);

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Seed Script] Connected to database: "${conn.connection.name}" on ${conn.connection.host}`);

    let upsertedCount = 0;
    for (const lab of initialLabs) {
      const result = await Lab.findOneAndUpdate(
        { lab_id: lab.lab_id },
        { $set: lab },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`  ✓ Upserted lab: [${result.lab_id}] "${result.title}" (Type: ${result.type})`);
      upsertedCount++;
    }

    console.log(`[Seed Script] Successfully seeded/updated ${upsertedCount} labs in kaushalai_labs collection.`);
    await mongoose.disconnect();
    console.log('[Seed Script] Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Script Error] Failed to seed labs:`, err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed, initialLabs };
