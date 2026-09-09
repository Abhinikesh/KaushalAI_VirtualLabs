/**
 * Browser-based JavaScript Sandbox Runner
 * Safely executes user-authored JavaScript in an isolated async scope,
 * captures console output, shadows sensitive globals, and extracts execution scope.
 */

// Helper to safely serialize console arguments
function formatConsoleArgs(args) {
  return args
    .map((arg) => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');
}

// Extract variable names from code and tasks to build scope return dictionary
function getScopeIdentifiers(code, tasks = []) {
  const identifiers = new Set(['results']);

  // Extract declared identifiers from user code: const x, let y, var z, function foo
  const declRegex = /(?:const|let|var|function\*?)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g;
  let match;
  while ((match = declRegex.exec(code)) !== null) {
    if (match[1]) identifiers.add(match[1]);
  }

  // Extract variables targeted in task configs
  tasks.forEach((task) => {
    const varName = task.validation_config?.variable;
    if (varName && typeof varName === 'string') {
      const rootVar = varName.split(/[\.\[]/)[0].trim();
      if (rootVar) identifiers.add(rootVar);
    }
    const funcName = task.validation_config?.function_name;
    if (funcName && typeof funcName === 'string') {
      identifiers.add(funcName.trim());
    }
  });

  return Array.from(identifiers);
}

/**
 * ARCHITECTURAL TRADEOFF DECISION: Infinite Loop Safeguard
 * --------------------------------------------------------
 * We use an in-flight loop iteration guard injection combined with an asynchronous timeout
 * instead of a Web Worker.
 *
 * WHY:
 * 1. Web Workers cannot transfer user-defined JavaScript functions (e.g., `calculate`,
 *    `hasKeyword`, `loadAndProcessUsers`) because structured clone throws a DataCloneError
 *    on functions.
 * 2. In this learning & training platform, learners benefit most from immediate diagnostic feedback.
 * 3. By injecting a lightweight iteration guard (`if (++__loopGuard > 200000) throw Error(...)`),
 *    runaway `while(true)` or unbounded `for` loops are interrupted safely within milliseconds
 *    with a clean diagnostic message without freezing the browser UI tab.
 */
function injectLoopGuards(code) {
  let counter = 0;
  return code.replace(
    /(\b(?:while|for)\s*\([^)]*\)\s*\{|\bdo\s*\{)/g,
    (match) => {
      counter++;
      return `${match} if (typeof __lg_${counter} === 'undefined') var __lg_${counter} = 0; if (++__lg_${counter} > 200000) throw new Error("Infinite loop detected: exceeded 200,000 iterations");`;
    }
  );
}

/**
 * Execute user JavaScript code
 * @param {string} userCode - User authored code
 * @param {Array} tasks - Lab validation tasks to inspect
 * @returns {Promise<{ success: boolean, stdout: string, stderr: string, error: string|null, executionTime: number, scope: object }>}
 */
export async function runJavaScriptCode(userCode, tasks = []) {
  const startTime = performance.now();
  const stdoutLogs = [];
  const stderrLogs = [];

  // Preserve native console references
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;

  let executionScope = {};
  let executionError = null;
  let success = true;

  // Intercept console calls
  console.log = (...args) => {
    const formatted = formatConsoleArgs(args);
    stdoutLogs.push(formatted);
    originalLog('[JS Lab Output]', ...args);
  };
  console.info = (...args) => {
    const formatted = formatConsoleArgs(args);
    stdoutLogs.push(formatted);
  };
  console.warn = (...args) => {
    const formatted = formatConsoleArgs(args);
    stderrLogs.push(`[WARN] ${formatted}`);
  };
  console.error = (...args) => {
    const formatted = formatConsoleArgs(args);
    stderrLogs.push(`[ERROR] ${formatted}`);
  };

  try {
    const scopeKeys = getScopeIdentifiers(userCode, tasks);

    // Build scope exporter snippet
    const exportEntries = scopeKeys
      .map((k) => `"${k}": (typeof ${k} !== 'undefined' ? ${k} : undefined)`)
      .join(', ');
    const returnSnippet = `\n;return { ...((typeof results !== 'undefined' && results) || {}), ${exportEntries} };`;

    // Construct sandboxed async execution function
    // Shadow sensitive browser APIs from direct accidental access
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

    const shadowArgs = [
      'window',
      'document',
      'localStorage',
      'sessionStorage',
      'parent',
      'top',
      'location'
    ];

    const shadowValues = shadowArgs.map(() => undefined);

    const guardedCode = injectLoopGuards(userCode);
    const wrappedCode = `"use strict";\n${guardedCode}${returnSnippet}`;

    const sandboxFn = new AsyncFunction(...shadowArgs, wrappedCode);


    // Execute with timeout protection (4 seconds max for async promises)
    const execPromise = sandboxFn(...shadowValues);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Execution timed out (limit: 4000ms)')), 4000)
    );

    const returnedScope = await Promise.race([execPromise, timeoutPromise]);
    if (returnedScope && typeof returnedScope === 'object') {
      executionScope = returnedScope;
    }
  } catch (err) {
    success = false;
    executionError = err.stack || err.message || String(err);
    stderrLogs.push(executionError);
  } finally {
    // Restore native console unconditionally
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
  }

  const executionTime = Math.round(performance.now() - startTime);

  return {
    success,
    stdout: stdoutLogs.join('\n'),
    stderr: stderrLogs.join('\n'),
    error: executionError,
    executionTime,
    scope: executionScope
  };
}
