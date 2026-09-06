const Lab = require('../models/Lab');

const sampleLabs = [
  {
    lab_id: 'lab-python-basics',
    title: 'Clean Official Statistical Microdata with Pandas',
    description: 'Inspect district survey records, eliminate duplicate entries, drop missing values, and calculate summary literacy metrics using Pandas.',
    type: 'python_sandbox',
    course_id: '6a996d6d266163e0a9606c61',
    competency_ids: ['comp-python-pandas', 'comp-data-cleaning'],
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
    course_id: '6a996d6d266163e0a9606c61',
    competency_ids: ['comp-survey-sampling', 'comp-python-math'],
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
  }
];

async function seedLabs() {
  try {
    for (const sample of sampleLabs) {
      await Lab.findOneAndUpdate(
        { lab_id: sample.lab_id },
        { $set: sample },
        { upsert: true, new: true }
      );
    }
    console.log(`[Seed Labs] Seeded ${sampleLabs.length} sample labs successfully into kaushalai_labs`);
  } catch (err) {
    console.warn(`[Seed Labs] Warning seeding labs: ${err.message}`);
  }
}

module.exports = { seedLabs, sampleLabs };
