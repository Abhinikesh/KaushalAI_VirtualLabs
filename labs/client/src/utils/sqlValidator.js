/**
 * Task Validation Engine for Virtual Labs SQL Sandbox
 * Evaluates student query results against declared task validation rules.
 */

/**
 * Validates a single SQL task against the query execution result
 *
 * @param {Object} task - Task definition from lab config
 * @param {Object} queryResult - Result from executeSqlQuery { success, columns, rows, rowCount, error }
 * @returns {{ taskId: string, passed: boolean, reason: string }}
 */
export function validateSqlTask(task, queryResult) {
  const { id, validation_type, validation_config } = task;

  if (!queryResult || !queryResult.success) {
    return {
      taskId: id,
      passed: false,
      reason: queryResult?.error ? `Query Error: ${queryResult.error}` : 'Query execution failed'
    };
  }

  const { columns = [], rows = [], rowCount = 0 } = queryResult;

  try {
    switch (validation_type) {
      case 'row_count_equals': {
        const expected = validation_config?.expected_row_count;
        const passed = rowCount === expected;
        return {
          taskId: id,
          passed,
          reason: passed
            ? `Query returned exactly ${expected} rows as expected`
            : `Expected ${expected} rows, but query returned ${rowCount}`
        };
      }

      case 'result_contains': {
        const targetValue = String(validation_config?.value ?? '').toLowerCase().trim();
        let found = false;

        // Search through all cells in all rows
        for (const row of rows) {
          for (const cell of row) {
            const cellStr = String(cell ?? '').toLowerCase();
            if (cellStr === targetValue || cellStr.includes(targetValue)) {
              found = true;
              break;
            }
          }
          if (found) break;
        }

        return {
          taskId: id,
          passed: found,
          reason: found
            ? `Result set contains expected value "${validation_config?.value}"`
            : `Expected result set to contain "${validation_config?.value}"`
        };
      }

      case 'column_values_match': {
        const colName = (validation_config?.column || '').toLowerCase().trim();
        const expectedValues = validation_config?.expected_values || [];
        const strictOrder = Boolean(validation_config?.strict_order);

        // Find column index (case-insensitive)
        const colIndex = columns.findIndex((c) => (c || '').toLowerCase().trim() === colName);
        if (colIndex === -1) {
          return {
            taskId: id,
            passed: false,
            reason: `Column "${validation_config?.column}" not found in SELECT results (available: ${columns.join(', ') || 'none'})`
          };
        }

        const actualValues = rows.map((r) => r[colIndex]);

        if (actualValues.length !== expectedValues.length) {
          return {
            taskId: id,
            passed: false,
            reason: `Expected ${expectedValues.length} values for column "${validation_config?.column}", got ${actualValues.length}`
          };
        }

        if (strictOrder) {
          // Compare with exact position/ordering
          for (let i = 0; i < expectedValues.length; i++) {
            const exp = expectedValues[i];
            const act = actualValues[i];
            if (String(exp).trim() !== String(act).trim()) {
              return {
                taskId: id,
                passed: false,
                reason: `Row ${i + 1} mismatch: expected "${exp}", got "${act}"`
              };
            }
          }
        } else {
          // Order-independent comparison: sort both arrays and compare
          const sortedExp = [...expectedValues].map((v) => String(v).trim().toLowerCase()).sort();
          const sortedAct = [...actualValues].map((v) => String(v).trim().toLowerCase()).sort();

          for (let i = 0; i < sortedExp.length; i++) {
            if (sortedExp[i] !== sortedAct[i]) {
              return {
                taskId: id,
                passed: false,
                reason: `Column values mismatch: missing expected "${sortedExp[i]}"`
              };
            }
          }
        }

        return {
          taskId: id,
          passed: true,
          reason: `All ${expectedValues.length} values in column "${validation_config?.column}" matched expected results`
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
 * Validates all declared tasks against the query result
 */
export function validateAllSqlTasks(tasks = [], queryResult) {
  return tasks.map((task) => validateSqlTask(task, queryResult));
}
