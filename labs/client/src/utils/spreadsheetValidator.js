/**
 * Spreadsheet Task Validator
 * Evaluates tasks against Handsontable grid instance (HyperFormula engine).
 * 
 * Supports:
 * - "cell_value_equals": checks resolved/computed value at [row, col] with floating-point tolerance
 * - "cell_value_not_equals": verifies cell does not equal a disallowed value (e.g. for deduplication)
 * - "column_values_match": order-independent check of resolved values in a column
 * - "formula_used": inspects raw source data to ensure formula starts with "="
 */

const FLOAT_TOLERANCE = 0.01;

function isNumeric(val) {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return !isNaN(num) && isFinite(num);
}

function numbersClose(a, b, tolerance = FLOAT_TOLERANCE) {
  return Math.abs(Number(a) - Number(b)) <= tolerance;
}

/**
 * Validates a single spreadsheet task against the active Handsontable instance.
 * @param {Object} task
 * @param {Object} hotInstance - Handsontable instance
 * @returns {{ passed: boolean, reason?: string }}
 */
export function validateSpreadsheetTask(task, hotInstance) {
  if (!hotInstance) {
    return { passed: false, reason: 'Grid instance not ready' };
  }

  const { validation_type, validation_config = {} } = task;

  try {
    switch (validation_type) {
      case 'cell_value_equals': {
        const { row, col, expected_value } = validation_config;
        if (row === undefined || col === undefined) {
          return { passed: false, reason: 'Missing row or col coordinate in validation config' };
        }

        // Extract display value if actualValue is a DetailedCellError or object
        let displayValue = actualValue;
        if (actualValue && typeof actualValue === 'object' && actualValue.value) {
          displayValue = actualValue.value;
        }

        // Check for HyperFormula evaluation errors (#CYCLE!, #ERROR!, #DIV/0!, #REF!, etc.)
        if (typeof displayValue === 'string' && displayValue.startsWith('#') && displayValue.endsWith('!')) {
          return {
            passed: false,
            reason: `Formula evaluation error in cell: ${displayValue}`
          };
        }

        if (displayValue === null || displayValue === undefined || displayValue === '') {
          return { passed: false, reason: `Cell at row ${row + 1}, col ${col + 1} is empty` };
        }

        // Numeric comparison with tolerance
        if (isNumeric(expected_value) && isNumeric(displayValue)) {
          if (numbersClose(displayValue, expected_value)) {
            return { passed: true };
          }
          return {
            passed: false,
            reason: `Expected ${expected_value}, but got ${displayValue}`
          };
        }

        // String comparison
        const normActual = String(displayValue).trim().toLowerCase();
        const normExpected = String(expected_value).trim().toLowerCase();
        if (normActual === normExpected) {
          return { passed: true };
        }

        return {
          passed: false,
          reason: `Expected "${expected_value}", but found "${displayValue}"`
        };
      }

      case 'cell_value_not_equals': {
        const { row, col, disallowed_value } = validation_config;
        if (row === undefined || col === undefined) {
          return { passed: false, reason: 'Missing row or col coordinate in validation config' };
        }

        let actualValue = hotInstance.getDataAtCell(row, col);
        if (actualValue && typeof actualValue === 'object' && actualValue.value) {
          actualValue = actualValue.value;
        }

        if (actualValue === null || actualValue === undefined || actualValue === '') {
          // Empty cell satisfies not-equals
          return { passed: true };
        }

        const normActual = String(actualValue).trim().toLowerCase();
        const normDisallowed = String(disallowed_value).trim().toLowerCase();

        if (normActual !== normDisallowed) {
          return { passed: true };
        }

        return {
          passed: false,
          reason: `Cell still contains disallowed value "${disallowed_value}"`
        };
      }

      case 'column_values_match': {
        const { col, expected_values = [] } = validation_config;
        if (col === undefined) {
          return { passed: false, reason: 'Missing column coordinate in validation config' };
        }

        const totalRows = hotInstance.countRows();
        const actualValues = [];

        for (let r = 0; r < totalRows; r++) {
          let val = hotInstance.getDataAtCell(r, col);
          if (val && typeof val === 'object' && val.value) {
            val = val.value;
          }
          if (val !== null && val !== undefined && val !== '') {
            actualValues.push(val);
          }
        }

        // Check if all expected values are present
        const matchedIndices = new Set();

        for (const exp of expected_values) {
          let found = false;
          for (let i = 0; i < actualValues.length; i++) {
            if (matchedIndices.has(i)) continue;

            const act = actualValues[i];
            if (isNumeric(exp) && isNumeric(act)) {
              if (numbersClose(act, exp)) {
                matchedIndices.add(i);
                found = true;
                break;
              }
            } else {
              if (String(act).trim().toLowerCase() === String(exp).trim().toLowerCase()) {
                matchedIndices.add(i);
                found = true;
                break;
              }
            }
          }

          if (!found) {
            return {
              passed: false,
              reason: `Missing expected column value: ${exp}`
            };
          }
        }

        return { passed: true };
      }

      case 'formula_used': {
        const { row, col } = validation_config;
        if (row === undefined || col === undefined) {
          return { passed: false, reason: 'Missing row or col coordinate in validation config' };
        }

        // Read raw source data, NOT computed data
        const rawValue = hotInstance.getSourceDataAtCell(row, col);

        if (typeof rawValue === 'string' && rawValue.trim().startsWith('=')) {
          return { passed: true };
        }

        return {
          passed: false,
          reason: `Cell at row ${row + 1}, col ${col + 1} does not contain an Excel formula (must start with "=")`
        };
      }

      default:
        return { passed: false, reason: `Unknown validation type: ${validation_type}` };
    }
  } catch (err) {
    return { passed: false, reason: `Validation error: ${err.message}` };
  }
}

/**
 * Validates all tasks against the Handsontable instance.
 * @param {Array} tasks
 * @param {Object} hotInstance
 * @returns {Array<{ passed: boolean, reason?: string }>}
 */
export function validateAllSpreadsheetTasks(tasks, hotInstance) {
  if (!Array.isArray(tasks) || !hotInstance) return [];
  return tasks.map((task) => validateSpreadsheetTask(task, hotInstance));
}
