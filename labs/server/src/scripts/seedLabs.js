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
  },
  {
    lab_id: 'lab-js-calculator',
    title: 'Core Functions: Arithmetic Calculator & Input Validation',
    description: 'Build a robust arithmetic calculation function supporting addition, subtraction, multiplication, division, and error handling for zero division.',
    type: 'js_sandbox',
    course_title: 'Modern JavaScript & Web Application Development',
    competency_tags: ['JavaScript Basics', 'Functions & Logic', 'Error Handling', 'IT & Digital Skills'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: Functions, Operators & Conditional Logic
Implement a reusable mathematical calculator function handling basic operations and mathematical boundary checks.

#### Tasks:
1. **Addition**: \`calculate(20, 30, "add")\` returns \`50\`.
2. **Multiplication**: \`calculate(7, 8, "multiply")\` returns \`56\`.
3. **Division by Zero Protection**: \`calculate(10, 0, "divide")\` returns \`"Error: Division by zero"\`.
4. **Log Report**: Log message containing \`[CALCULATOR_READY]\`.`,
      starter_code: `/**
 * Calculator function
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @param {string} operation - "add", "subtract", "multiply", "divide"
 * @returns {number|string} Result or error message
 */
function calculate(a, b, operation) {
  // TODO 1: Implement "add", "subtract", "multiply", "divide"
  // TODO 2: Return "Error: Division by zero" if operation === "divide" and b === 0
  return 0;
}

// Sample test calculations
const sumResult = calculate(45, 15, "add");
const divResult = calculate(100, 4, "divide");
const zeroDivResult = calculate(50, 0, "divide");

// TODO 3: Print summary report with tag '[CALCULATOR_READY]'
console.log(\`[CALCULATOR_READY] Sum: \${sumResult}, Div: \${divResult}\`);
`,
      tasks: [
        {
          id: 'task_calc_add',
          description: 'calculate(20, 30, "add") returns 50',
          validation_type: 'function_returns',
          validation_config: {
            function_name: 'calculate',
            args: [20, 30, 'add'],
            expected: 50
          }
        },
        {
          id: 'task_calc_multiply',
          description: 'calculate(7, 8, "multiply") returns 56',
          validation_type: 'function_returns',
          validation_config: {
            function_name: 'calculate',
            args: [7, 8, 'multiply'],
            expected: 56
          }
        },
        {
          id: 'task_calc_zero_div',
          description: 'calculate(10, 0, "divide") returns "Error: Division by zero"',
          validation_type: 'function_returns',
          validation_config: {
            function_name: 'calculate',
            args: [10, 0, 'divide'],
            expected: 'Error: Division by zero'
          }
        },
        {
          id: 'task_calc_log',
          description: 'Console output contains "[CALCULATOR_READY]"',
          validation_type: 'console_output_contains',
          validation_config: {
            expected: '[CALCULATOR_READY]'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-js-dates',
    title: 'Date & Time Utilities: Difference Calculation & Formatting',
    description: 'Calculate the number of calendar days between two dates and format ISO date strings into readable localized Indian date formats.',
    type: 'js_sandbox',
    course_title: 'Modern JavaScript & Web Application Development',
    competency_tags: ['JavaScript Basics', 'Date Processing', 'Utility Functions', 'IT & Digital Skills'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: Date & Time Manipulation
Practice parsing, formatting, and computing durations between dates using JavaScript's native \`Date\` object.

#### Tasks:
1. **Days Difference**: Implement \`daysBetween(startDateStr, endDateStr)\` returning whole days difference.
2. **Date Localization**: Implement \`formatToIndianDate(dateStr)\` returning \`"DD/MM/YYYY"\`.
3. **Log Summary**: Log message containing \`[DATE_UTILITIES_VERIFIED]\`.`,
      starter_code: `/**
 * Calculate the number of full days between two date strings (YYYY-MM-DD)
 */
function daysBetween(startDateStr, endDateStr) {
  // TODO 1: Parse dates and calculate whole days difference
  return 0;
}

/**
 * Format date string (YYYY-MM-DD) into DD/MM/YYYY
 */
function formatToIndianDate(dateStr) {
  // TODO 2: Return formatted string "DD/MM/YYYY"
  return "";
}

// Sample test usage
const sampleDays = daysBetween("2026-01-01", "2026-01-11");
const formattedSample = formatToIndianDate("2026-08-15");

// TODO 3: Print summary containing tag '[DATE_UTILITIES_VERIFIED]'
console.log(\`[DATE_UTILITIES_VERIFIED] Days diff: \${sampleDays}, Formatted: \${formattedSample}\`);
`,
      tasks: [
        {
          id: 'task_days_between',
          description: 'daysBetween("2026-01-01", "2026-01-11") returns 10',
          validation_type: 'function_returns',
          validation_config: {
            function_name: 'daysBetween',
            args: ['2026-01-01', '2026-01-11'],
            expected: 10
          }
        },
        {
          id: 'task_format_date',
          description: 'formatToIndianDate("2026-08-15") returns "15/08/2026"',
          validation_type: 'function_returns',
          validation_config: {
            function_name: 'formatToIndianDate',
            args: ['2026-08-15'],
            expected: '15/08/2026'
          }
        },
        {
          id: 'task_date_log',
          description: 'Console output contains "[DATE_UTILITIES_VERIFIED]"',
          validation_type: 'console_output_contains',
          validation_config: {
            expected: '[DATE_UTILITIES_VERIFIED]'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-html-profile-card',
    title: 'Digital Identity: Structure & Style an Official Profile Card',
    description: 'Create a structured digital employee identity card using semantic HTML elements and clean CSS box model styling.',
    type: 'html_css_sandbox',
    course_title: 'Digital Documentation & Web Fundamentals',
    competency_tags: ['Digital Documentation', 'HTML & Web Standards', 'CSS Styling', 'Basic Document Handling', 'IT & Digital Skills'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: Structure and Style a Personnel Profile Card

In digital documentation and government e-office platforms, official employee identification cards require semantic structure and clean, consistent visual styling.

#### Tasks:
1. **Official Name Header**: Inside \`.profile-card\`, add an \`<h2>\` element containing the name **Ananya Sharma**.
2. **Designation Paragraph**: Add a \`<p>\` element with class \`designation\` containing **Senior Statistical Officer**.
3. **Card Border**: Update the \`.profile-card\` rule in CSS so its \`border-style\` is \`solid\`.
4. **Flexbox Alignment**: Set \`.profile-card\` CSS \`display\` property to \`flex\`.`,
      starter_html: `<div class="card-container">
  <div class="profile-card">
    <div class="avatar-badge">AO</div>
    <!-- TODO 1: Add an <h2> element with the employee's full name: "Ananya Sharma" -->
    
    <!-- TODO 2: Add a <p class="designation"> element with designation: "Senior Statistical Officer" -->
    
    <div class="meta-section">
      <span class="badge">Ministry of Statistics</span>
      <span class="badge">Employee ID: #ST-8821</span>
    </div>
  </div>
</div>`,
      starter_css: `body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.profile-card {
  width: 320px;
  background-color: #ffffff;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  /* TODO 3: Set border-style to "solid" with a 2px border width */
  border: 2px dashed #cbd5e1;
  /* TODO 4: Configure display to "flex" and flex-direction to "column" */
  display: block;
  align-items: center;
}

.avatar-badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  font-weight: 700;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.badge {
  display: inline-block;
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 9999px;
  margin: 4px;
}`,
      tasks: [
        {
          id: 'task_profile_h2',
          description: 'Add an <h2> element inside .profile-card for the employee name',
          validation_type: 'element_exists',
          validation_config: {
            selector: '.profile-card h2'
          }
        },
        {
          id: 'task_profile_p',
          description: 'Add a <p> or <p class="designation"> element for the employee title',
          validation_type: 'element_exists',
          validation_config: {
            selector: '.profile-card p'
          }
        },
        {
          id: 'task_profile_border',
          description: 'Set .profile-card border-style to "solid"',
          validation_type: 'css_property_equals',
          validation_config: {
            selector: '.profile-card',
            property: 'border-style',
            expected_value: 'solid'
          }
        },
        {
          id: 'task_profile_display',
          description: 'Set .profile-card display property to "flex"',
          validation_type: 'css_property_equals',
          validation_config: {
            selector: '.profile-card',
            property: 'display',
            expected_value: 'flex'
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-html-broken-layout',
    title: 'Layout Diagnostics: Fix Responsive Multi-Column Alignment',
    description: 'Diagnose and repair a broken multi-column report layout using CSS Flexbox, box-sizing, and responsive spacing.',
    type: 'html_css_sandbox',
    course_title: 'Digital Documentation & Web Fundamentals',
    competency_tags: ['Digital Documentation', 'CSS Layouts', 'Responsive Design', 'IT & Digital Skills'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: Layout Diagnostics & Alignment

In official data portals and administrative dashboards, reports must present metrics side-by-side in balanced multi-column containers. Currently, the dashboard container is stacking columns vertically.

#### Tasks:
1. **Enable Flexbox Layout**: In \`.container\`, change the \`display\` property from \`block\` to \`flex\` so columns align side-by-side.
2. **Apply Box Sizing**: In \`.metric-card\`, set \`box-sizing\` to \`border-box\` so padding and borders do not cause overflow.
3. **Verify Column Count**: Ensure both metric columns remain inside \`.container\` (exact count of 2 child cards).`,
      starter_html: `<div class="report-wrapper">
  <header class="report-header">
    <h1>District Quarterly Performance Metrics</h1>
    <p>Official monitoring overview for administrative divisions</p>
  </header>

  <!-- Notice the columns are currently stacking vertically instead of side-by-side -->
  <div class="container">
    <div class="metric-card column-left">
      <h3>Revenue Collection</h3>
      <p class="number">₹ 42.8 Cr</p>
      <span class="status positive">+12.4% vs Target</span>
    </div>
    <div class="metric-card column-right">
      <h3>Public Grievances Resolved</h3>
      <p class="number">98.2%</p>
      <span class="status positive">3,420 Cases Closed</span>
    </div>
  </div>
</div>`,
      starter_css: `body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  padding: 30px;
  margin: 0;
}

.report-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.report-header {
  margin-bottom: 24px;
}

/* FIX REQUIRED: The container currently stacks columns vertically. 
   TODO 1: Change display from 'block' to 'flex' so child columns sit side-by-side. */
.container {
  display: block; /* Change this to flex */
  gap: 20px;
}

/* FIX REQUIRED: 
   TODO 2: Set box-sizing to 'border-box' so padding doesn't overflow the columns. */
.metric-card {
  box-sizing: content-box; /* Change this to border-box */
  flex: 1;
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.number {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 8px 0;
}

.status.positive {
  color: #16a34a;
  font-size: 13px;
  font-weight: 600;
}`,
      tasks: [
        {
          id: 'task_container_flex',
          description: 'Set .container display property to "flex"',
          validation_type: 'css_property_equals',
          validation_config: {
            selector: '.container',
            property: 'display',
            expected_value: 'flex'
          }
        },
        {
          id: 'task_metric_box_sizing',
          description: 'Set .metric-card box-sizing to "border-box"',
          validation_type: 'css_property_equals',
          validation_config: {
            selector: '.metric-card',
            property: 'box-sizing',
            expected_value: 'border-box'
          }
        },
        {
          id: 'task_columns_count',
          description: 'Ensure .container contains exactly 2 .metric-card elements',
          validation_type: 'element_count_equals',
          validation_config: {
            selector: '.container .metric-card',
            count: 2
          }
        }
      ]
    }
  },
  {
    lab_id: 'lab-html-citizen-form',
    title: 'Citizen Services: Semantic Portal Application Form',
    description: 'Construct an accessible, semantic citizen service application form with descriptive labels and official government portal styling.',
    type: 'html_css_sandbox',
    course_title: 'Government Digital Platforms & Citizen Services',
    competency_tags: ['Digital Documentation', 'Government Digital Platforms', 'Form Accessibility', 'Basic Document Handling'],
    is_active: true,
    config: {
      instructions: `### Lab Objective: Accessible Citizen Services Form

Government digital platforms require accessible, clear semantic form structures with matching descriptive labels and clean action controls.

#### Tasks:
1. **Applicant Name Label**: Add a \`<label for="applicant_name">\` element inside \`.portal-form\` for the applicant name input.
2. **District Label**: Add a \`<label for="district">\` element inside \`.portal-form\` for the district input (verifying at least 2 \`<label>\` tags exist).
3. **Action Button Pointer**: In CSS, update \`.submit-btn\` so its \`cursor\` property is \`pointer\`.
4. **Action Confirmation**: Ensure the \`.submit-btn\` displays text containing **Submit**.`,
      starter_html: `<div class="portal-container">
  <header class="portal-header">
    <div class="emblem-tag">National e-District Portal</div>
    <h1>Application for Certificate of Domicile</h1>
    <p class="subtitle">Please provide accurate applicant details as per official government records.</p>
  </header>

  <form class="portal-form">
    <div class="form-group">
      <!-- TODO 1: Add a <label for="applicant_name">Full Name of Applicant</label> -->
      
      <input type="text" id="applicant_name" placeholder="Enter full name" />
    </div>

    <div class="form-group">
      <!-- TODO 2: Add a <label for="district">District of Residence</label> -->
      
      <input type="text" id="district" placeholder="e.g. Varanasi, Lucknow" />
    </div>

    <!-- TODO 3 & 4: Style the submit button and ensure it contains the text "Submit Application" -->
    <button type="button" class="submit-btn">Submit Application</button>
  </form>
</div>`,
      starter_css: `body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background-color: #f0f4f8;
  color: #1e293b;
  padding: 40px 20px;
  margin: 0;
}

.portal-container {
  max-width: 520px;
  margin: 0 auto;
  background: #ffffff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-top: 5px solid #1e40af;
}

.emblem-tag {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 6px;
}

h1 {
  font-size: 20px;
  margin: 0 0 6px 0;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.form-group {
  margin-bottom: 18px;
}

/* Accessible form labels */
.portal-form label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.portal-form input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

/* TODO 3: Ensure button has cursor: pointer and prominent government action styling */
.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #1e40af;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  /* Set cursor to pointer */
  cursor: default; /* Change to pointer */
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #1d4ed8;
}`,
      tasks: [
        {
          id: 'task_form_labels',
          description: 'Add descriptive <label> elements for each input (count equals 2)',
          validation_type: 'element_count_equals',
          validation_config: {
            selector: '.portal-form label',
            count: 2
          }
        },
        {
          id: 'task_button_cursor',
          description: 'Set .submit-btn cursor property to "pointer"',
          validation_type: 'css_property_equals',
          validation_config: {
            selector: '.submit-btn',
            property: 'cursor',
            expected_value: 'pointer'
          }
        },
        {
          id: 'task_button_text',
          description: 'Ensure .submit-btn text contains "Submit"',
          validation_type: 'text_content_contains',
          validation_config: {
            selector: '.submit-btn',
            expected_substring: 'Submit'
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
