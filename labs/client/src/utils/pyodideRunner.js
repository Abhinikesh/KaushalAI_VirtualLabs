/**
 * Pyodide WebAssembly Sandbox Runner
 * Loads Pyodide v0.26.2 in-browser and executes Python code safely with stdout/stderr interception.
 */

let pyodideInstance = null;
let pyodideLoadingPromise = null;
const loadedPackages = new Set();

const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';

/**
 * Ensures the Pyodide CDN script is appended to document.head
 */
function loadPyodideScript() {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) {
      return resolve();
    }

    const existingScript = document.querySelector(`script[src="${PYODIDE_CDN_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', resolve);
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = PYODIDE_CDN_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error('Failed to load Pyodide script from CDN: ' + err.message));
    document.head.appendChild(script);
  });
}

/**
 * Initializes or returns the singleton Pyodide instance
 */
export async function getPyodideInstance(onStatusUpdate = () => {}) {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = (async () => {
    onStatusUpdate('Downloading WebAssembly runtime (~8MB)...');
    await loadPyodideScript();

    onStatusUpdate('Initializing Python WebAssembly environment...');
    const pyodide = await window.loadPyodide({
      indexURL: PYODIDE_INDEX_URL
    });

    pyodideInstance = pyodide;
    onStatusUpdate('Pyodide ready.');
    return pyodide;
  })();

  return pyodideLoadingPromise;
}

/**
 * Preloads Python scientific packages (pandas, numpy, etc.) if requested by lab
 */
export async function loadExpectedPackages(pyodide, packages = [], onStatusUpdate = () => {}) {
  if (!packages || packages.length === 0) return;

  const toLoad = packages.filter((pkg) => !loadedPackages.has(pkg));
  if (toLoad.length === 0) return;

  onStatusUpdate(`Loading Python packages: ${toLoad.join(', ')}...`);
  for (const pkg of toLoad) {
    try {
      await pyodide.loadPackage(pkg);
      loadedPackages.add(pkg);
    } catch (err) {
      console.warn(`Could not load package '${pkg}':`, err);
    }
  }
  onStatusUpdate('Packages loaded.');
}

/**
 * Executes python code inside Pyodide with stdout/stderr capture.
 *
 * @param {string} code - Python code to execute
 * @param {Array<string>} packages - packages to preload
 * @param {Function} onStatusUpdate - progress callback
 * @returns {Promise<{ stdout: string, stderr: string, error: string|null, executionTimeMs: number }>}
 */
export async function runPythonCode(code, packages = [], onStatusUpdate = () => {}) {
  const pyodide = await getPyodideInstance(onStatusUpdate);
  await loadExpectedPackages(pyodide, packages, onStatusUpdate);

  onStatusUpdate('Executing code...');
  const startTime = performance.now();

  let stdout = '';
  let stderr = '';
  let error = null;

  try {
    // Wrap code in Python stdout & stderr capturing harness
    const executionHarness = `
import sys
import io

__orig_stdout__ = sys.stdout
__orig_stderr__ = sys.stderr

__capture_stdout__ = io.StringIO()
__capture_stderr__ = io.StringIO()

sys.stdout = __capture_stdout__
sys.stderr = __capture_stderr__

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
finally:
    sys.stdout = __orig_stdout__
    sys.stderr = __orig_stderr__

__captured_out_val__ = __capture_stdout__.getvalue()
__captured_err_val__ = __capture_stderr__.getvalue()
`;

    await pyodide.runPythonAsync(executionHarness);

    stdout = pyodide.globals.get('__captured_out_val__') || '';
    stderr = pyodide.globals.get('__captured_err_val__') || '';
  } catch (err) {
    error = err.message || String(err);
    // Attempt to read any partial output before crash
    try {
      stdout = pyodide.globals.get('__captured_out_val__') || '';
    } catch (e) {}
  }

  const executionTimeMs = Math.round(performance.now() - startTime);
  onStatusUpdate('Execution completed.');

  return {
    pyodide,
    stdout: String(stdout),
    stderr: String(stderr),
    error,
    executionTimeMs
  };
}
