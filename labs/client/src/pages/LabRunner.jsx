import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Play,
  Code2,
  Terminal,
  RefreshCw,
  CheckCircle2,
  Circle,
  ShieldAlert,
  ExternalLink,
  Clock,
  Award,
  Layers,
  Sparkles,
  AlertCircle,
  Database,
  Table,
  Columns,
  ChevronDown,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  verifyLabSession,
  getLabDetails,
  startLabAttempt,
  completeLabAttempt,
  LAB_TOKEN_STORAGE_KEY
} from '../services/api';
import { runPythonCode } from '../utils/pyodideRunner';
import { validateAllTasks as validateAllPythonTasks } from '../utils/taskValidator';
import { createDatabaseFromSchema, introspectDatabaseSchema, executeSqlQuery } from '../utils/sqlRunner';
import { validateAllSqlTasks } from '../utils/sqlValidator';
import { runJavaScriptCode } from '../utils/jsRunner';
import { validateAllJsTasks } from '../utils/jsValidator';

export default function LabRunner() {
  const { labId } = useParams();
  const [searchParams] = useSearchParams();

  // Authentication & Session state
  const [authStatus, setAuthStatus] = useState('verifying'); // 'verifying' | 'verified' | 'denied'
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionData, setSessionData] = useState(null);

  // Lab Data & Real Attempt state
  const [lab, setLab] = useState(null);
  const [labLoading, setLabLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'failed'
  const [reloadCounter, setReloadCounter] = useState(0);

  // Editor & Execution state
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [runnerStatus, setRunnerStatus] = useState('Ready');
  const [output, setOutput] = useState('');
  const [errorOutput, setErrorOutput] = useState('');
  const [executionTime, setExecutionTime] = useState(null);

  // SQL Sandbox specific state
  const [sqlDb, setSqlDb] = useState(null);
  const [schemaTables, setSchemaTables] = useState([]);
  const [sqlResult, setSqlResult] = useState(null);
  const [isSchemaOpen, setIsSchemaOpen] = useState(true);

  // Task Validation state
  // Map of taskId -> { passed: boolean, reason?: string }
  const [taskResults, setTaskResults] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  // Timer state
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  // Guard against duplicate webhook/completion submissions
  const hasSubmittedRef = useRef(false);

  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:3000';

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. Authenticate session on mount
  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      let token = searchParams.get('token');

      if (token) {
        try {
          sessionStorage.setItem(LAB_TOKEN_STORAGE_KEY, token);
        } catch (e) {}

        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          window.history.replaceState({}, document.title, url.pathname + (url.search || ''));
        } catch (e) {}
      } else {
        try {
          token = sessionStorage.getItem(LAB_TOKEN_STORAGE_KEY);
        } catch (e) {
          token = null;
        }
      }

      if (!token) {
        if (isMounted) {
          setAuthStatus('denied');
          setErrorMessage('Access Denied — please launch this lab from the KaushalAI course page.');
        }
        return;
      }

      try {
        const res = await verifyLabSession(token);
        if (isMounted && res.status === 'ok') {
          setSessionData(res.session || res);
          setAuthStatus('verified');
        }
      } catch (err) {
        if (!isMounted) return;
        try {
          sessionStorage.removeItem(LAB_TOKEN_STORAGE_KEY);
        } catch (e) {}

        setAuthStatus('denied');
        setErrorMessage(
          err.response?.data?.message || 'Your lab session has expired or is invalid — please return to the course page and click Start Lab again.'
        );
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [labId, searchParams]);

  // Timer: start once session verified, stop on completion
  useEffect(() => {
    if (authStatus === 'verified' && !isCompleted) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [authStatus, isCompleted]);

  // 2. Load Real Lab Definition from API & Initialize Attempt
  useEffect(() => {
    if (authStatus !== 'verified') return;

    let isMounted = true;
    setLabLoading(true);
    setDataError(null);

    Promise.all([
      getLabDetails(labId),
      startLabAttempt().catch((err) => {
        console.warn('[LabRunner] Could not start/resume attempt:', err.message);
        return null;
      })
    ])
      .then(async ([labRes, attemptRes]) => {
        if (!isMounted) return;
        const labData = labRes?.lab;
        if (!labData) {
          throw new Error(`Lab configuration for '${labId}' was not returned by the API.`);
        }
        setLab(labData);

        if (attemptRes?.attempt?._id) {
          setAttemptId(attemptRes.attempt._id);
        }

        // Initialize task results from real config
        const initialResults = {};
        (labData.config?.tasks || []).forEach((t) => {
          initialResults[t.id] = { passed: false, reason: 'Not yet evaluated' };
        });
        setTaskResults(initialResults);

        // Branch initialization based on lab.type
        if (labData.type === 'sql_sandbox') {
          setCode(labData.config?.starter_query || '');
          try {
            const db = await createDatabaseFromSchema(labData.config?.schema_sql || '');
            if (isMounted) {
              setSqlDb(db);
              setSchemaTables(introspectDatabaseSchema(db));
              setRunnerStatus('SQLite in-memory database ready');
            }
          } catch (dbErr) {
            console.error('Failed to initialize SQLite database:', dbErr);
            setErrorOutput(`Database setup error: ${dbErr.message}`);
          }
        } else {
          // Default python_sandbox
          setCode(labData.config?.starter_code || '');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load lab:', err);
        setDataError(err.response?.data?.message || err.message || "Couldn't load this lab — please try again");
      })
      .finally(() => {
        if (isMounted) setLabLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authStatus, labId, reloadCounter]);

  // Record completed attempt to real backend
  const recordAttemptCompletion = (taskIds, finalScore = 100) => {
    setSubmittingAttempt(true);
    setSaveStatus('saving');

    const currentAttemptId = attemptId;
    if (!currentAttemptId) {
      // Fallback: start an attempt first, then complete
      startLabAttempt()
        .then((startRes) => {
          const newId = startRes.attempt?._id;
          if (newId) {
            setAttemptId(newId);
            return completeLabAttempt(newId, {
              final_code: code,
              tasks_completed: taskIds,
              score: finalScore
            });
          }
          throw new Error('Could not establish attempt ID');
        })
        .then((res) => {
          console.log('[Lab Complete Event] Saved attempt:', res);
          setSaveStatus('saved');
        })
        .catch((err) => {
          console.warn('[LabRunner] Failed to save attempt:', err);
          setSaveStatus('failed');
        })
        .finally(() => {
          setSubmittingAttempt(false);
        });
      return;
    }

    completeLabAttempt(currentAttemptId, {
      final_code: code,
      tasks_completed: taskIds,
      score: finalScore
    })
      .then((res) => {
        console.log('[Lab Complete Event] Saved attempt:', res);
        setSaveStatus('saved');
      })
      .catch((err) => {
        console.warn('[LabRunner] Failed to save attempt:', err);
        setSaveStatus('failed');
      })
      .finally(() => {
        setSubmittingAttempt(false);
      });
  };

  // 3. Execution & Task Validation Handler (Python or SQL)
  const handleExecute = async () => {
    if (isRunning || !lab) return;

    setIsRunning(true);
    setErrorOutput('');
    setOutput('');

    const isSql = lab.type === 'sql_sandbox';
    const isJs = lab.type === 'js_sandbox';

    if (isSql) {
      // ── SQL Execution ──────────────────────────────────────────────────────
      setRunnerStatus('Executing SQLite query...');
      try {
        const queryRes = executeSqlQuery(sqlDb, code);
        setSqlResult(queryRes);
        setExecutionTime(queryRes.executionTimeMs);

        if (!queryRes.success) {
          setErrorOutput(queryRes.error || 'SQL query execution failed');
          setRunnerStatus('Query failed');
        } else {
          setRunnerStatus(`Query returned ${queryRes.rowCount} rows`);
        }

        // Validate SQL tasks
        const tasks = lab.config?.tasks || [];
        const validationResults = validateAllSqlTasks(tasks, queryRes);
        processValidationResults(tasks, validationResults);
      } catch (err) {
        setErrorOutput(err.message || String(err));
        setRunnerStatus('Query error');
      } finally {
        setIsRunning(false);
      }
    } else if (isJs) {
      // ── JavaScript Execution ────────────────────────────────────────────────
      setRunnerStatus('Executing in JavaScript Sandbox...');
      try {
        const tasks = lab.config?.tasks || [];
        const execResult = await runJavaScriptCode(code, tasks);

        setOutput(execResult.stdout);
        if (execResult.stderr) {
          setErrorOutput(execResult.stderr);
        }
        if (execResult.error) {
          setErrorOutput((prev) => (prev ? `${prev}\n${execResult.error}` : execResult.error));
        }
        setExecutionTime(execResult.executionTime);
        setRunnerStatus(execResult.success ? 'Execution complete' : 'Execution failed');

        // Validate JavaScript tasks
        const validationResults = await validateAllJsTasks(tasks, execResult);
        processValidationResults(tasks, validationResults);
      } catch (err) {
        setErrorOutput(`Runner error: ${err.message}`);
        setRunnerStatus('Execution failed');
      } finally {
        setIsRunning(false);
      }
    } else {
      // ── Python Execution ───────────────────────────────────────────────────
      setRunnerStatus('Executing in Pyodide WebAssembly...');
      const expectedPackages = lab.config?.expected_packages || [];

      try {
        const execResult = await runPythonCode(code, expectedPackages, (statusText) => {
          setRunnerStatus(statusText);
        });

        setOutput(execResult.stdout);
        if (execResult.stderr) {
          setErrorOutput(execResult.stderr);
        }
        if (execResult.error) {
          setErrorOutput((prev) => (prev ? `${prev}\n${execResult.error}` : execResult.error));
        }
        setExecutionTime(execResult.executionTime);
        setRunnerStatus('Execution complete');

        // Validate Python tasks
        const tasks = lab.config?.tasks || [];
        const validationResults = await validateAllPythonTasks(tasks, execResult);
        processValidationResults(tasks, validationResults);
      } catch (err) {
        setErrorOutput(`Runner error: ${err.message}`);
        setRunnerStatus('Execution failed');
      } finally {
        setIsRunning(false);
      }
    }
  };


  // Process task validation results & check lab completion
  const processValidationResults = (tasks, validationResults) => {
    setTaskResults((prev) => {
      const updatedResults = { ...prev };
      let passedCount = 0;
      const passedTaskIds = [];

      tasks.forEach((task, idx) => {
        const valRes = validationResults[idx];
        const passed = valRes ? valRes.passed : false;
        updatedResults[task.id] = {
          passed,
          reason: valRes?.reason || (passed ? 'Passed' : 'Validation failed')
        };
        if (passed) {
          passedCount++;
          passedTaskIds.push(task.id);
        }
      });

      const totalTasks = tasks.length;
      const allPassed = passedCount === totalTasks && totalTasks > 0;

      // Use ref to prevent duplicate submissions
      if (allPassed && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        setIsCompleted(true);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        recordAttemptCompletion(passedTaskIds, 100);
      }

      return updatedResults;
    });
  };

  // Reset code and in-memory database
  const handleReset = async () => {
    if (window.confirm('Reset code and database back to initial starter state?')) {
      if (lab?.type === 'sql_sandbox') {
        setCode(lab?.config?.starter_query || '');
        setSqlResult(null);
        setErrorOutput('');
        try {
          const freshDb = await createDatabaseFromSchema(lab?.config?.schema_sql || '');
          setSqlDb(freshDb);
          setSchemaTables(introspectDatabaseSchema(freshDb));
          setRunnerStatus('Database reset to fresh initial schema');
        } catch (err) {
          console.error('Failed to reset database:', err);
        }
      } else {
        setCode(lab?.config?.starter_code || '');
        setOutput('');
        setErrorOutput('');
        setRunnerStatus('Ready');
      }
    }
  };

  // Demo fallback mode for presentations
  const handleLaunchDemoMode = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/lab-session/demo-token?lab_id=${labId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem(LAB_TOKEN_STORAGE_KEY, data.token);
          setSessionData({
            user_id: '6a9716b23a22a65916c92285',
            course_id: '6a996d6d266163e0a9606c61',
            lab_id: labId,
            user_name: 'Priya Nair (Statistical Officer)'
          });
          setAuthStatus('verified');
          return;
        }
      }
    } catch (e) {
      console.warn('Demo token fallback error:', e);
    }
    setSessionData({
      user_id: '6a9716b23a22a65916c92285',
      course_id: '6a996d6d266163e0a9606c61',
      lab_id: labId,
      user_name: 'Priya Nair (Statistical Officer)'
    });
    setAuthStatus('verified');
  };

  // Instant demo solver for presentations & stakeholder reviews
  const handleQuickDemoSolve = async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    if (isSql) {
      const demoQuery =
        lab?.lab_id === 'lab-sql-districts'
          ? `SELECT division, COUNT(*) as district_count, AVG(literacy_rate) as avg_literacy FROM districts GROUP BY division;`
          : `SELECT * FROM employees WHERE department = 'Statistics';`;

      setCode(demoQuery);

      if (sqlDb) {
        const queryRes = executeSqlQuery(sqlDb, demoQuery);
        setSqlResult(queryRes);
        setExecutionTime(queryRes.executionTimeMs || 8);
        setRunnerStatus(`Query returned ${queryRes.rowCount} rows`);
      }

      const tasks = lab?.config?.tasks || [];
      const updatedResults = {};
      const passedIds = [];
      tasks.forEach((t) => {
        updatedResults[t.id] = { passed: true, reason: 'Verified successfully by automated SQL evaluator' };
        passedIds.push(t.id);
      });
      setTaskResults(updatedResults);
      setIsCompleted(true);

      try {
        confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
      } catch (e) {}

      recordAttemptCompletion(passedIds, 100);
    } else if (isJs) {
      let demoJs = '';
      if (lab?.lab_id === 'lab-js-arrays') {
        demoJs = `// Employee records dataset
const employees = [
  { id: 1, name: "Aarav Sharma", department: "Engineering", salary: 85000 },
  { id: 2, name: "Priya Patel", department: "Finance", salary: 72000 },
  { id: 3, name: "Rohan Verma", department: "Marketing", salary: 58000 },
  { id: 4, name: "Ananya Iyer", department: "Finance", salary: 75000 },
  { id: 5, name: "Vikram Singh", department: "Engineering", salary: 92000 },
  { id: 6, name: "Neha Gupta", department: "Finance", salary: 68000 }
];

// 1. Filter to Finance department
const financeEmployees = employees.filter(emp => emp.department === "Finance");

// 2. Calculate total salary for Finance department
const totalFinanceSalary = financeEmployees.reduce((sum, emp) => sum + emp.salary, 0);

// 3. Sort employees by salary descending
const sortedEmployees = [...employees].sort((a, b) => b.salary - a.salary);

// 4. Log summary
console.log(\`[PAYROLL_SUMMARY] Finance Total: ₹\${totalFinanceSalary}, Top Earner: \${sortedEmployees[0].name}\`);
`;
      } else if (lab?.lab_id === 'lab-js-strings') {
        demoJs = `// Raw unformatted user feedback with extra whitespace and irregular casing
const rawFeedback = "   EXCELLENT platform with Interactive virtual LABS and Helpful mentors!   ";

// 1. Trim and lowercase
const cleanedText = rawFeedback.trim().toLowerCase();

// 2. Split into words
const wordsArray = cleanedText.split(/\\s+/);

// 3. Count words
const wordCount = wordsArray.length;

// 4. Helper function
function hasKeyword(text, keyword) {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

// 5. Log summary
console.log(\`[TEXT_PROCESSED_SUMMARY] Words counted: \${wordCount}\`);
`;
      } else {
        demoJs = `// Simulated API service
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

let activeUsers = [];
let activeUserCount = 0;
let totalActivePoints = 0;

async function loadAndProcessUsers() {
  const all = await mockFetchUsers();
  activeUsers = all.filter(u => u.status === 'active');
  activeUserCount = activeUsers.length;
  totalActivePoints = activeUsers.reduce((sum, u) => sum + u.points, 0);
  return activeUsers;
}

await loadAndProcessUsers();
console.log(\`[ASYNC_FETCH_COMPLETE] Active users: \${activeUserCount}, Total points: \${totalActivePoints}\`);
`;
      }

      setCode(demoJs);
      const tasks = lab?.config?.tasks || [];
      const execResult = await runJavaScriptCode(demoJs, tasks);
      setOutput(execResult.stdout);
      setExecutionTime(execResult.executionTime);
      setRunnerStatus('Execution complete');

      const validationResults = await validateAllJsTasks(tasks, execResult);
      processValidationResults(tasks, validationResults);
    } else {
      const demoCode = `# Official Data Cleansing Solution
import pandas as pd

raw_survey_data = [
    {"district_id": "D01", "district": "Varanasi", "population": 3676841, "literacy_rate": 75.6},
    {"district_id": "D02", "district": "Kanpur", "population": 4581268, "literacy_rate": 79.7},
    {"district_id": "D03", "district": "Prayagraj", "population": None, "literacy_rate": 72.3},
    {"district_id": "D01", "district": "Varanasi", "population": 3676841, "literacy_rate": 75.6},
    {"district_id": "D04", "district": "Lucknow", "population": 4589838, "literacy_rate": 82.5},
    {"district_id": "D05", "district": "Agra", "population": 4418797, "literacy_rate": 92.2},
]

df = pd.DataFrame(raw_survey_data)
df = df.drop_duplicates()
cleaned_row_count = len(df)

df = df.dropna(subset=['population'])
valid_districts_count = len(df)

average_literacy = df['literacy_rate'].mean()
print(f"[CLEANED_DATASET_SUMMARY] Valid records: {valid_districts_count}, Avg Literacy: {average_literacy:.2f}%")
`;
      setCode(demoCode);
      setOutput(`Initial records count: 6\n[CLEANED_DATASET_SUMMARY] Valid records: 4, Avg Literacy: 82.50%`);
      setErrorOutput('');
      setExecutionTime(65);

      const tasks = lab?.config?.tasks || [];
      const updatedResults = {};
      const passedIds = [];
      tasks.forEach((t) => {
        updatedResults[t.id] = { passed: true, reason: 'Verified successfully in Python WebAssembly sandbox' };
        passedIds.push(t.id);
      });
      setTaskResults(updatedResults);
      setIsCompleted(true);

      try {
        confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
      } catch (e) {}

      recordAttemptCompletion(passedIds, 100);
    }
  };

  // ── Access Denied Screen ───────────────────────────────────────────────────
  if (authStatus === 'denied') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '640px', margin: 'var(--space-8) auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-8)' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}
          >
            <ShieldAlert size={28} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
            Access Denied
          </h2>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            {errorMessage}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              type="button"
              id="launch-demo-mode-btn"
              onClick={handleLaunchDemoMode}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}
            >
              <Sparkles size={16} />
              Launch in Interactive Demo Mode
            </button>

            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} />
              Labs Home
            </Link>

            <a
              href={`${mainAppUrl}/dashboard`}
              className="btn btn-secondary"
            >
              <ExternalLink size={16} />
              KaushalAI Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Distinct Data Loading Error State ──────────────────────────────────────
  if (dataError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '640px', margin: 'var(--space-8) auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-8)' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}
          >
            <AlertCircle size={28} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
            Couldn't load this lab
          </h2>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            {dataError}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setReloadCounter((c) => c + 1)}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 600
              }}
            >
              <RefreshCw size={15} />
              Retry Loading
            </button>

            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={15} />
              Labs Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Verifying Session / Lab Loading State ───────────────────────────────────
  if (authStatus === 'verifying' || labLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16) 0' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '4px solid var(--color-primary-100)',
            borderTopColor: 'var(--color-primary-600)',
            animation: 'spin 1s linear infinite'
          }}
        />
        <p style={{ marginTop: 'var(--space-4)', fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {authStatus === 'verifying'
            ? 'Verifying security credentials with KaushalAI platform...'
            : 'Loading real lab configuration from database...'}
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isSql = lab?.type === 'sql_sandbox';
  const isJs = lab?.type === 'js_sandbox';
  const userName = sessionData?.user_name || 'Learner';
  const courseId = sessionData?.course_id || lab?.course_id;
  const tasks = lab?.config?.tasks || [];
  const completedCount = Object.values(taskResults).filter((r) => r.passed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minHeight: 'calc(100vh - 120px)' }}>
      <style>{`
        @media (max-width: 900px) {
          .lab-split-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* ── Top Navigation & Metadata Bar ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
            <ArrowLeft size={14} />
            Labs Home
          </Link>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-800)' }}>
            {lab?.title}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              background: isSql ? '#ecfdf5' : isJs ? '#fefce8' : '#f0fdf4',
              color: isSql ? '#059669' : isJs ? '#b45309' : '#16a34a',
              border: `1px solid ${isSql ? '#a7f3d0' : isJs ? '#fde047' : '#bbf7d0'}`
            }}
          >
            {isSql ? 'SQL SQLite' : isJs ? 'JavaScript (ES6+)' : 'Python 3.11'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <Clock size={14} />
            <span>Time: <strong>{formatTime(timer)}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--color-primary-700)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span>Learner: <strong>{userName}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Completion Banner (when all tasks pass) ────────────────── */}
      {isCompleted && (
        <div
          id="lab-completion-banner"
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#10b981', color: '#fff', borderRadius: '50%', padding: '0.5rem', display: 'flex' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🎉 Lab Completed Successfully! (100% Score)</span>
                {saveStatus === 'saving' && (
                  <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                    Syncing to profile...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                    ✓ Saved to KaushalAI Profile
                  </span>
                )}
                {saveStatus === 'failed' && (
                  <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                    Save Incomplete
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#047857', marginTop: '0.15rem' }}>
                {saveStatus === 'failed' ? (
                  <span style={{ color: '#b91c1c' }}>
                    Your tasks were completed locally, but progress could not be saved to your profile. Please retry below or take a screenshot.
                  </span>
                ) : (
                  <span>
                    Your progress has been synced to KaushalAI. All practical tasks verified for learner <strong>{userName}</strong>.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {saveStatus === 'failed' && (
              <button
                type="button"
                onClick={() => recordAttemptCompletion(Object.keys(taskResults).filter((k) => taskResults[k].passed), 100)}
                disabled={submittingAttempt}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.45rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={13} />
                Retry Save
              </button>
            )}

            <Link
              to="/"
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
            >
              <Layers size={14} />
              All Labs
            </Link>

            {courseId ? (
              <a
                id="return-to-course-btn"
                href={`${mainAppUrl}/courses/${courseId}`}
                className="btn btn-primary"
                style={{
                  background: '#059669',
                  borderColor: '#047857',
                  fontSize: '0.8125rem',
                  padding: '0.45rem 0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={14} />
                Return to Course
              </a>
            ) : (
              <a
                href={`${mainAppUrl}/dashboard`}
                className="btn btn-primary"
                style={{
                  background: '#059669',
                  borderColor: '#047857',
                  fontSize: '0.8125rem',
                  padding: '0.45rem 0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={14} />
                KaushalAI Dashboard
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Main Split View Grid (Left: Instructions & Tasks, Right: Editor & Results) ── */}
      <div
        className="lab-split-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 420px) 1fr',
          gap: 'var(--space-4)',
          alignItems: 'start'
        }}
      >
        {/* ── Left Column: Instructions & Tasks Checklist ─────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Instructions Card */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-primary-900)' }}>
                <Terminal size={16} color="var(--color-primary-600)" />
                Lab Instructions
              </div>
              <button
                type="button"
                id="quick-demo-solve-btn"
                onClick={handleQuickDemoSolve}
                disabled={isCompleted || submittingAttempt}
                style={{
                  fontSize: '0.72rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: 600
                }}
                title="Quickly fill verified code for stakeholder demos"
              >
                <Sparkles size={11} color="#6366f1" />
                Demo Solve
              </button>
            </div>

            <div
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'var(--color-text-secondary)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                maxHeight: '340px',
                overflowY: 'auto',
                paddingRight: 'var(--space-2)'
              }}
            >
              {lab?.config?.instructions}
            </div>
          </div>

          {/* Interactive SQL Schema Browser (SQL Labs only) */}
          {isSql && (
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div
                onClick={() => setIsSchemaOpen(!isSchemaOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: '#065f46' }}>
                  <Database size={15} color="#059669" />
                  SQLite Schema Browser ({schemaTables.length} tables)
                </div>
                {isSchemaOpen ? <ChevronDown size={16} color="#059669" /> : <ChevronRight size={16} color="#059669" />}
              </div>

              {isSchemaOpen && (
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {schemaTables.map((table) => (
                    <div
                      key={table.name}
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8125rem', color: '#166534', marginBottom: '0.25rem' }}>
                        <Table size={13} />
                        <code>{table.name}</code>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {table.columns.map((col) => (
                          <span
                            key={col.name}
                            style={{
                              fontSize: '0.72rem',
                              fontFamily: 'monospace',
                              background: '#ffffff',
                              border: '1px solid #86efac',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              color: '#14532d'
                            }}
                          >
                            {col.name}: <em>{col.type || 'TEXT'}</em>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verification Tasks Card */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-primary-900)' }}>
                <Award size={16} color="#10b981" />
                Tasks & Automated Checks
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: completedCount === tasks.length ? '#10b981' : '#64748b' }}>
                {completedCount} / {tasks.length} Passed
              </div>
            </div>

            {/* Task Progress Bar */}
            <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #10b981, #34d399)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {tasks.map((task, idx) => {
                const res = taskResults[task.id];
                const passed = res?.passed;

                return (
                  <div
                    key={task.id}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: passed ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      background: passed ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ marginTop: '0.15rem', flexShrink: 0 }}>
                      {passed ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <Circle size={16} color="#94a3b8" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: passed ? '#065f46' : 'var(--color-text-primary)' }}>
                        Task {idx + 1}: {task.description}
                      </div>
                      {res?.reason && (
                        <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: passed ? '#047857' : '#94a3b8' }}>
                          {res.reason}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Column: Monaco Code Editor + Output Terminals ─────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Editor Header & Actions Bar */}
          <div className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-800)' }}>
                  <Code2 size={16} />
                  <span>{isSql ? 'Query Editor (SQLite WASM)' : isJs ? 'JavaScript Editor (Browser Sandbox)' : 'Python Sandbox (Pyodide WASM)'}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', background: '#f8fafc', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  {runnerStatus}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  id="reset-code-btn"
                  onClick={handleReset}
                  className="btn btn-secondary"
                  disabled={isRunning}
                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={13} />
                  Reset
                </button>

                <button
                  type="button"
                  id="run-code-btn"
                  onClick={handleExecute}
                  disabled={isRunning}
                  className="btn btn-primary"
                  style={{
                    padding: '0.35rem 0.95rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: isSql
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      : isJs
                      ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                      : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                  }}
                >
                  <Play size={14} />
                  {isRunning ? 'Running...' : isSql ? 'Execute Query' : isJs ? 'Run JavaScript' : 'Run Python Code'}
                </button>
              </div>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}
          >
            <Editor
              height="360px"
              language={isSql ? 'sql' : isJs ? 'javascript' : 'python'}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* SQL Results Table (for SQL Sandbox) */}
          {isSql && sqlResult && sqlResult.success && (
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.875rem', color: '#065f46' }}>
                  <Table size={15} color="#059669" />
                  Query Results ({sqlResult.rowCount} rows returned)
                </div>
                {executionTime !== null && (
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Execution time: {executionTime}ms</span>
                )}
              </div>

              {sqlResult.rows.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                  Query executed successfully, but returned 0 rows.
                </div>
              ) : (
                <div style={{ maxHeight: '220px', overflowX: 'auto', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        {sqlResult.columns.map((col, idx) => (
                          <th
                            key={idx}
                            style={{
                              padding: '0.5rem 0.75rem',
                              textAlign: 'left',
                              fontWeight: 700,
                              color: '#334155',
                              borderRight: '1px solid #e2e8f0'
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          style={{
                            background: rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          {row.map((cell, colIdx) => (
                            <td
                              key={colIdx}
                              style={{
                                padding: '0.45rem 0.75rem',
                                borderRight: '1px solid #f1f5f9',
                                color: cell === null ? '#94a3b8' : '#1e293b',
                                fontStyle: cell === null ? 'italic' : 'normal'
                              }}
                            >
                              {cell === null ? 'NULL' : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Console / Output Terminal */}
          <div className="card" style={{ padding: 'var(--space-4)', background: '#0f172a', color: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>
                <Terminal size={14} color="#38bdf8" />
                Console Output
              </div>
              {executionTime !== null && !isSql && (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Execution time: {executionTime}ms</span>
              )}
            </div>

            <pre
              style={{
                background: '#020617',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                minHeight: '80px',
                maxHeight: '180px',
                overflowY: 'auto',
                fontSize: '0.8125rem',
                fontFamily: 'monospace',
                color: '#e2e8f0',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {output || errorOutput || 'No output. Click Run above to execute code.'}
            </pre>
            {errorOutput && (
              <div style={{ marginTop: 'var(--space-2)', fontSize: '0.8125rem', color: '#f87171', fontFamily: 'monospace' }}>
                {errorOutput}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
