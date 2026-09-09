/**
 * JavaScript Lab Task Validation Engine
 * Evaluates student code results against defined validation rules:
 * - console_output_contains
 * - variable_equals
 * - function_returns
 */

// Safely resolve nested variable paths like 'obj.prop', 'arr.length', or 'arr[0].name'
function resolvePath(obj, path) {
  if (!obj || !path) return undefined;

  // Normalize path notation: 'a[0].b' -> ['a', '0', 'b']
  const normalized = path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/^\./, '');
  const parts = normalized.split('.');

  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

// Deep equality comparison
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Validate a single JS task
 * @param {object} task - Task definition
 * @param {object} execResult - Output from runJavaScriptCode
 * @returns {Promise<{ passed: boolean, reason: string }>}
 */
export async function validateJsTask(task, execResult) {
  if (!execResult) {
    return { passed: false, reason: 'No execution result available.' };
  }

  const { validation_type, validation_config = {} } = task;

  // If code threw a syntax/runtime error, check if task was console/variable check
  if (!execResult.success && execResult.error) {
    return {
      passed: false,
      reason: `Execution failed with error: ${execResult.error.split('\n')[0]}`
    };
  }

  switch (validation_type) {
    case 'console_output_contains': {
      const expected = validation_config.expected || validation_config.substring || '';
      const stdout = execResult.stdout || '';

      if (stdout.includes(expected)) {
        return { passed: true, reason: `Console output contains "${expected}"` };
      }
      return {
        passed: false,
        reason: `Expected console output to contain "${expected}", but got: "${stdout.slice(0, 80)}..."`
      };
    }

    case 'variable_equals': {
      const varPath = validation_config.variable;
      const expected = validation_config.expected;

      if (!varPath) {
        return { passed: false, reason: 'Task misconfigured: missing variable name.' };
      }

      const scope = execResult.scope || {};
      let actual = resolvePath(scope, varPath);

      // Check results object fallback if present
      if (actual === undefined && scope.results) {
        actual = resolvePath(scope.results, varPath);
      }

      if (actual === undefined) {
        return {
          passed: false,
          reason: `Variable or property "${varPath}" is not defined.`
        };
      }

      if (deepEqual(actual, expected) || String(actual).trim() === String(expected).trim()) {
        return {
          passed: true,
          reason: `Variable "${varPath}" matches expected value.`
        };
      }

      return {
        passed: false,
        reason: `Variable "${varPath}" is ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}.`
      };
    }

    case 'function_returns': {
      const funcName = validation_config.function_name;
      const args = validation_config.args || [];
      const expected = validation_config.expected;
      const expectedLength = validation_config.expected_length;
      const isAsync = validation_config.is_async;

      if (!funcName) {
        return { passed: false, reason: 'Task misconfigured: missing function_name.' };
      }

      const scope = execResult.scope || {};
      const fn = scope[funcName];

      if (typeof fn !== 'function') {
        return {
          passed: false,
          reason: `Function "${funcName}" is not defined or is not a callable function.`
        };
      }

      try {
        let result;
        if (isAsync) {
          result = await fn(...args);
        } else {
          result = fn(...args);
        }

        if (expectedLength !== undefined) {
          if (Array.isArray(result) && result.length === expectedLength) {
            return {
              passed: true,
              reason: `Function "${funcName}" returned array with length ${expectedLength}.`
            };
          }
          return {
            passed: false,
            reason: `Function "${funcName}" returned length ${result?.length ?? 'N/A'}, expected ${expectedLength}.`
          };
        }

        if (expected !== undefined) {
          if (deepEqual(result, expected) || String(result) === String(expected)) {
            return {
              passed: true,
              reason: `Function "${funcName}" returned expected output.`
            };
          }
          return {
            passed: false,
            reason: `Function "${funcName}" returned ${JSON.stringify(result)}, expected ${JSON.stringify(expected)}.`
          };
        }

        return { passed: true, reason: `Function "${funcName}" executed successfully.` };
      } catch (callErr) {
        return {
          passed: false,
          reason: `Error calling function "${funcName}": ${callErr.message}`
        };
      }
    }

    default:
      return {
        passed: false,
        reason: `Unsupported validation type: "${validation_type}"`
      };
  }
}

/**
 * Validate all tasks in a JavaScript lab
 * @param {Array} tasks - Array of task specifications
 * @param {object} execResult - Output from runJavaScriptCode
 * @returns {Promise<Array<{ passed: boolean, reason: string }>>}
 */
export async function validateAllJsTasks(tasks = [], execResult) {
  const results = [];
  for (const task of tasks) {
    const res = await validateJsTask(task, execResult);
    results.push(res);
  }
  return results;
}
