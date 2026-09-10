/**
 * Regex & Text Processing Task Validator
 * Validates tasks against live RegExp matches or live JavaScript transformation output.
 * 
 * Supports:
 * - "regex_matches_all": confirms all expected strings appear in matches
 * - "regex_matches_none": confirms no disallowed/excluded strings appear in matches
 * - "regex_match_count_equals": confirms total match count equals expected_count (optionally evaluated against custom pattern on transformed text)
 * - "transform_output_equals": confirms transformed text equals expected output (with whitespace trimming)
 */

/**
 * Validates a single regex or transformation task.
 * @param {Object} task - Task configuration object
 * @param {Object} context - Evaluation context
 * @param {string[]} context.matches - Array of matched substrings
 * @param {string} context.sampleText - Input sample data
 * @param {string} context.transformOutput - Resulting text from JavaScript transformation
 * @param {string|null} context.transformError - Error thrown by transformation, if any
 * @param {string|null} context.regexError - Syntax error from RegExp constructor, if any
 * @param {string} context.pattern - Current regex pattern string
 * @returns {{ passed: boolean, reason?: string }}
 */
export function validateRegexTask(task, context = {}) {
  const {
    matches = [],
    sampleText = '',
    transformOutput = '',
    transformError = null,
    regexError = null,
    pattern = ''
  } = context;

  const { validation_type, validation_config = {} } = task;

  try {
    switch (validation_type) {
      case 'regex_matches_all': {
        if (regexError) {
          return { passed: false, reason: `Pattern syntax error: ${regexError}` };
        }
        if (!pattern || pattern.trim() === '') {
          return { passed: false, reason: 'Enter a regular expression pattern' };
        }

        const expected = validation_config.expected_matches || [];
        if (!Array.isArray(expected) || expected.length === 0) {
          return { passed: true, reason: 'No expected matches specified' };
        }

        const missing = expected.filter((exp) => !matches.includes(exp));
        if (missing.length === 0) {
          return {
            passed: true,
            reason: `All ${expected.length} expected targets successfully matched`
          };
        }

        return {
          passed: false,
          reason: `Missing match(es): ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` (+${missing.length - 3} more)` : ''}`
        };
      }

      case 'regex_matches_none': {
        if (regexError) {
          return { passed: false, reason: `Pattern syntax error: ${regexError}` };
        }
        if (!pattern || pattern.trim() === '') {
          return { passed: false, reason: 'Enter a regular expression pattern' };
        }

        const disallowed = validation_config.disallowed_matches || validation_config.excluded_matches || [];
        if (!Array.isArray(disallowed) || disallowed.length === 0) {
          return { passed: true, reason: 'No excluded matches specified' };
        }

        const forbiddenFound = disallowed.filter((dis) => matches.includes(dis));
        if (forbiddenFound.length === 0) {
          return {
            passed: true,
            reason: 'Pattern correctly excluded all disallowed targets'
          };
        }

        return {
          passed: false,
          reason: `Accidentally matched invalid target(s): ${forbiddenFound.slice(0, 3).join(', ')}`
        };
      }

      case 'regex_match_count_equals': {
        const expectedCount = validation_config.expected_count ?? 0;

        // If custom pattern is specified in config (e.g. validating format of transformed output)
        if (validation_config.pattern) {
          try {
            const rx = new RegExp(validation_config.pattern, 'g');
            const targetText = transformOutput !== '' ? transformOutput : sampleText;
            const found = targetText.match(rx);
            const actualCount = found ? found.length : 0;

            if (actualCount === expectedCount) {
              return {
                passed: true,
                reason: `Output contains exactly ${actualCount} matching target(s)`
              };
            }

            return {
              passed: false,
              reason: `Found ${actualCount} matching element(s), expected exactly ${expectedCount}`
            };
          } catch (e) {
            return {
              passed: false,
              reason: `Error testing pattern '${validation_config.pattern}': ${e.message}`
            };
          }
        }

        // Standard regex match count from user's pattern
        if (regexError) {
          return { passed: false, reason: `Pattern syntax error: ${regexError}` };
        }
        if (!pattern || pattern.trim() === '') {
          return { passed: false, reason: 'Enter a regular expression pattern' };
        }

        const actualCount = matches.length;
        if (actualCount === expectedCount) {
          return {
            passed: true,
            reason: `Found exactly ${actualCount} matching element(s)`
          };
        }

        return {
          passed: false,
          reason: `Pattern matched ${actualCount} item(s), expected exactly ${expectedCount}`
        };
      }

      case 'transform_output_equals': {
        if (transformError) {
          return { passed: false, reason: `Transformation error: ${transformError}` };
        }

        if (!transformOutput || transformOutput.trim() === '') {
          return { passed: false, reason: 'Execute or write transformation code to produce output' };
        }

        const expectedOutput = validation_config.expected_output || '';
        // Normalize newlines (\r\n -> \n) and trim leading/trailing whitespace
        const normalizedActual = transformOutput.replace(/\r\n/g, '\n').trim();
        const normalizedExpected = expectedOutput.replace(/\r\n/g, '\n').trim();

        if (normalizedActual === normalizedExpected) {
          return {
            passed: true,
            reason: 'Transformed output matches expected target exactly'
          };
        }

        return {
          passed: false,
          reason: 'Transformed output does not match expected format'
        };
      }

      default:
        return {
          passed: false,
          reason: `Unknown validation type '${validation_type}'`
        };
    }
  } catch (err) {
    return {
      passed: false,
      reason: `Validation error: ${err.message}`
    };
  }
}

/**
 * Validates an array of tasks against the regex evaluation context.
 * @param {Array<Object>} tasks - List of task objects
 * @param {Object} context - Regex evaluation context
 * @returns {Array<{ passed: boolean, reason?: string }>}
 */
export function validateAllRegexTasks(tasks = [], context = {}) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((task) => validateRegexTask(task, context));
}
