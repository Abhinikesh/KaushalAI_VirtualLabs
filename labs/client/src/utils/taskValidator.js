/**
 * Task Validation Engine for Virtual Labs Python Sandbox
 * Evaluates student code results against declared task validation rules.
 */

/**
 * Validates a single task against the execution environment
 *
 * @param {Object} task - Task definition from lab config
 * @param {Object} execResult - Result from runPythonCode { pyodide, stdout, stderr, error }
 * @returns {Promise<{ taskId: string, passed: boolean, reason?: string }>}
 */
export async function validateTask(task, execResult) {
  const { pyodide, stdout, error } = execResult;
  const { id, validation_type, validation_config } = task;

  // If user code had a fatal syntax/runtime error, fail tasks unless checking for an expected error
  if (error && validation_type !== 'output_contains') {
    return {
      taskId: id,
      passed: false,
      reason: 'Execution ended with error'
    };
  }

  try {
    switch (validation_type) {
      case 'output_contains': {
        const targetSubstring = validation_config?.substring || '';
        const passed = stdout.includes(targetSubstring);
        return {
          taskId: id,
          passed,
          reason: passed
            ? 'Output contains required text'
            : `Expected console output to contain "${targetSubstring}"`
        };
      }

      case 'variable_equals': {
        const varName = validation_config?.variable;
        const expected = validation_config?.expected;
        const tolerance = validation_config?.tolerance || 0.001;

        if (!varName) {
          return { taskId: id, passed: false, reason: 'Variable configuration missing' };
        }

        // Use Pyodide to inspect variable safely in Python
        const checkSnippet = `
try:
    __var_exists__ = '${varName}' in globals()
    __var_val__ = globals().get('${varName}') if __var_exists__ else None
except:
    __var_exists__ = False
    __var_val__ = None
`;
        await pyodide.runPythonAsync(checkSnippet);

        const exists = pyodide.globals.get('__var_exists__');
        if (!exists) {
          return {
            taskId: id,
            passed: false,
            reason: `Variable '${varName}' was not defined`
          };
        }

        const actualVal = pyodide.globals.get('__var_val__');

        // Handle numeric comparison with optional tolerance
        if (typeof expected === 'number') {
          const numVal = Number(actualVal);
          const passed = Math.abs(numVal - expected) <= tolerance;
          return {
            taskId: id,
            passed,
            reason: passed
              ? `Variable '${varName}' matches expected value (${numVal})`
              : `Expected '${varName}' = ${expected}, got ${actualVal}`
          };
        }

        // Exact comparison
        const passed = actualVal === expected;
        return {
          taskId: id,
          passed,
          reason: passed
            ? `Variable '${varName}' matches expected value`
            : `Expected '${varName}' = ${JSON.stringify(expected)}, got ${JSON.stringify(actualVal)}`
        };
      }

      case 'function_returns': {
        const funcName = validation_config?.function;
        const testCases = validation_config?.test_cases || [];

        if (!funcName) {
          return { taskId: id, passed: false, reason: 'Function configuration missing' };
        }

        // Check if function exists
        const exists = await pyodide.runPythonAsync(`callable(globals().get('${funcName}'))`);
        if (!exists) {
          return {
            taskId: id,
            passed: false,
            reason: `Function '${funcName}' is not defined or not callable`
          };
        }

        // Run test cases
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const argsJson = JSON.stringify(tc.args || []);
          const testHarness = `
import json
__args__ = json.loads('''${argsJson}''')
__func__ = globals()['${funcName}']
__test_res__ = __func__(*__args__)
`;
          await pyodide.runPythonAsync(testHarness);
          const result = pyodide.globals.get('__test_res__');

          const expected = tc.expected;
          let match = false;
          if (typeof expected === 'number') {
            match = Math.abs(Number(result) - expected) < 0.01;
          } else {
            match = JSON.stringify(result) === JSON.stringify(expected);
          }

          if (!match) {
            return {
              taskId: id,
              passed: false,
              reason: `Test case ${i + 1} failed: ${funcName}(${argsJson}) returned ${result}, expected ${expected}`
            };
          }
        }

        return {
          taskId: id,
          passed: true,
          reason: `All ${testCases.length} test cases passed successfully`
        };
      }

      default:
        return {
          taskId: id,
          passed: false,
          reason: `Unknown validation type: ${validation_type}`
        };
    }
  } catch (err) {
    return {
      taskId: id,
      passed: false,
      reason: `Validation error: ${err.message}`
    };
  }
}

/**
 * Validates all tasks in a lab
 */
export async function validateAllTasks(tasks = [], execResult) {
  const results = [];
  for (const task of tasks) {
    const res = await validateTask(task, execResult);
    results.push(res);
  }
  return results;
}
