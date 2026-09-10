/**
 * Utility functions to validate HTML/CSS tasks against a rendered DOM document and window.
 */

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
}

function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Validates a single HTML/CSS task against the provided DOM document and window.
 * @param {Object} task - Task object from lab config
 * @param {Document} doc - The Document node (e.g. from iframe.contentDocument)
 * @param {Window} win - The Window object (e.g. from iframe.contentWindow)
 * @returns {{ passed: boolean, reason: string }}
 */
export function validateHtmlCssTask(task, doc, win) {
  if (!doc) {
    return { passed: false, reason: 'Preview document is not available' };
  }

  const { validation_type, validation_config = {} } = task;

  try {
    switch (validation_type) {
      case 'element_exists': {
        const { selector } = validation_config;
        if (!selector) {
          return { passed: false, reason: 'No selector specified in validation config' };
        }
        const el = doc.querySelector(selector);
        if (el) {
          return { passed: true, reason: `Element '${selector}' found in preview document` };
        }
        return { passed: false, reason: `Element '${selector}' not found in rendered document` };
      }

      case 'element_count_equals': {
        const { selector, count, expected_count } = validation_config;
        if (!selector) {
          return { passed: false, reason: 'No selector specified in validation config' };
        }
        const expected = count !== undefined ? count : (expected_count !== undefined ? expected_count : 0);
        const elements = doc.querySelectorAll(selector);
        const actualCount = elements.length;

        if (actualCount === expected) {
          return { passed: true, reason: `Found exactly ${actualCount} element(s) matching '${selector}'` };
        }
        return {
          passed: false,
          reason: `Found ${actualCount} element(s) matching '${selector}', expected ${expected}`
        };
      }

      case 'css_property_equals': {
        const { selector, property, expected_value, expected } = validation_config;
        if (!selector || !property) {
          return { passed: false, reason: 'Selector or property missing in validation config' };
        }

        const el = doc.querySelector(selector);
        if (!el) {
          return { passed: false, reason: `Element '${selector}' does not exist to evaluate CSS` };
        }

        if (!win || !win.getComputedStyle) {
          return { passed: false, reason: 'Computed styles engine unavailable' };
        }

        const computed = win.getComputedStyle(el);
        const expectedVal = String(expected_value !== undefined ? expected_value : expected || '').trim().toLowerCase();

        // Check various formats (kebab-case, camelCase, shorthand fallback)
        const kebabProp = camelToKebab(property);
        const camelProp = kebabToCamel(property);

        let actualVal = (computed.getPropertyValue(kebabProp) || computed[camelProp] || '').trim().toLowerCase();

        // Browser shorthand quirks (e.g. border-style might return empty string if border-top-style is set)
        if (!actualVal && kebabProp === 'border-style') {
          actualVal = (computed.getPropertyValue('border-top-style') || '').trim().toLowerCase();
        }

        if (actualVal === expectedVal) {
          return { passed: true, reason: `Computed '${property}' matches expected '${expectedVal}'` };
        }

        return {
          passed: false,
          reason: `Computed '${property}' is '${actualVal || 'none'}', expected '${expectedVal}'`
        };
      }

      case 'text_content_contains': {
        const { selector, expected_substring, substring } = validation_config;
        const targetSubstring = String(expected_substring !== undefined ? expected_substring : substring || '').trim().toLowerCase();
        const targetEl = selector ? doc.querySelector(selector) : doc.body;

        if (!targetEl) {
          return { passed: false, reason: `Element '${selector}' not found to inspect text` };
        }

        const actualText = (targetEl.textContent || '').trim().toLowerCase();
        if (actualText.includes(targetSubstring)) {
          return { passed: true, reason: `Text content contains "${targetSubstring}"` };
        }

        const snippet = actualText.length > 30 ? actualText.slice(0, 30) + '...' : actualText;
        return {
          passed: false,
          reason: `Text content ("${snippet}") does not contain "${targetSubstring}"`
        };
      }

      default:
        return { passed: false, reason: `Unknown validation type '${validation_type}'` };
    }
  } catch (err) {
    return { passed: false, reason: `Validation evaluation error: ${err.message}` };
  }
}

/**
 * Evaluates an array of tasks against a rendered document.
 * @param {Array} tasks
 * @param {Document} doc
 * @param {Window} win
 * @returns {Array<{ passed: boolean, reason: string }>}
 */
export function validateAllHtmlCssTasks(tasks = [], doc, win) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((task) => validateHtmlCssTask(task, doc, win));
}
