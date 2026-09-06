import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Code2,
  Terminal,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  UserCheck,
  Clock,
  Lock
} from 'lucide-react';
import { verifyLabSession, LAB_TOKEN_STORAGE_KEY } from '../services/api';

export default function LabRunner() {
  const { labId } = useParams();
  const [searchParams] = useSearchParams();

  // 'verifying' | 'verified' | 'denied'
  const [authStatus, setAuthStatus] = useState('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionData, setSessionData] = useState(null);

  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:3000';

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      // 1. Check for token in URL query parameter (?token=)
      let token = searchParams.get('token');

      if (token) {
        // Store in sessionStorage (not localStorage) for session lifetime
        try {
          sessionStorage.setItem(LAB_TOKEN_STORAGE_KEY, token);
        } catch (e) {
          console.warn('Could not access sessionStorage', e);
        }

        // Clean query parameter from URL bar without reloading
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          window.history.replaceState({}, document.title, url.pathname + (url.search || ''));
        } catch (e) {
          console.warn('Could not clean URL history', e);
        }
      } else {
        // Check existing token in sessionStorage
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

      // 2. Call backend verification endpoint
      try {
        const res = await verifyLabSession(token);
        if (isMounted && res.status === 'ok') {
          setSessionData(res.session);
          setAuthStatus('verified');
        }
      } catch (err) {
        if (!isMounted) return;
        try {
          sessionStorage.removeItem(LAB_TOKEN_STORAGE_KEY);
        } catch (e) {}

        const backendMsg = err.response?.data?.message;
        setAuthStatus('denied');
        setErrorMessage(
          backendMsg || 'Your lab session has expired or is invalid — please return to the course page and click Start Lab again.'
        );
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [labId, searchParams]);

  // ── Access Denied State ────────────────────────────────────────────────────
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

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} />
              Labs Home
            </Link>
            <a
              href={`${mainAppUrl}/dashboard`}
              className="btn btn-primary"
              style={{ background: 'var(--color-primary-600)' }}
            >
              <ExternalLink size={16} />
              Return to KaushalAI Courses
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Verifying Token State ──────────────────────────────────────────────────
  if (authStatus === 'verifying') {
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
          Verifying security credentials with KaushalAI platform...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ── Verified & Ready State ─────────────────────────────────────────────────
  const userName = sessionData?.user_name || 'Learner';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Link to="/" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
          <ArrowLeft size={14} />
          Back to Labs Home
        </Link>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>/</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary-700)' }}>
          Lab Runner
        </span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>/</span>
        <code style={{ fontSize: '0.8125rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
          {labId}
        </code>
      </div>

      {/* Verified Authentication Notification Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#10b981', color: '#fff', borderRadius: '50%', padding: '0.35rem', display: 'flex' }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#065f46' }}>
              Lab verified for {userName}, loading sandbox...
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857' }}>
              Authenticated SSO Session • User ID: <code>{sessionData?.user_id}</code> • Course ID: <code>{sessionData?.course_id}</code>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#047857' }}>
          <Clock size={14} />
          <span>Session Token: Active</span>
        </div>
      </div>

      {/* Lab Header Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Lab Session: <span style={{ color: 'var(--color-primary-600)' }}>{labId}</span>
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Interactive code editor and sandbox runner will be mounted here in Parts 3 &amp; 4.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => alert('Code reset will be active in Part 3')}>
            <RefreshCw size={14} />
            Reset Code
          </button>
          <button className="btn btn-primary" onClick={() => alert('Code execution sandbox will be active in Part 3')}>
            <Play size={14} />
            Run Solution (Part 3)
          </button>
        </div>
      </div>

      {/* Placeholder Split View Sandbox Wireframe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-6)', minHeight: '420px' }}>
        {/* Editor Area Placeholder */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ background: '#1e293b', color: '#94a3b8', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Code2 size={16} color="#38bdf8" />
              <span>solution.py</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#334155', color: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              Read-write
            </span>
          </div>

          <div style={{ background: '#0f172a', color: '#f8fafc', padding: 'var(--space-6)', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.875rem', lineHeight: 1.7 }}>
            <div style={{ color: '#64748b' }}># Virtual Labs Code Sandbox Placeholder</div>
            <div style={{ color: '#64748b' }}># Verified Learner: {userName}</div>
            <div style={{ color: '#64748b' }}># Lab ID: {labId}</div>
            <br />
            <div><span style={{ color: '#f43f5e' }}>def</span> <span style={{ color: '#38bdf8' }}>evaluate_competency</span>():</div>
            <div style={{ paddingLeft: '1.5rem', color: '#a5b4fc' }}>"""</div>
            <div style={{ paddingLeft: '1.5rem', color: '#a5b4fc' }}>Interactive Monaco / Ace code editor will be mounted here in Part 4.</div>
            <div style={{ paddingLeft: '1.5rem', color: '#a5b4fc' }}>"""</div>
            <div style={{ paddingLeft: '1.5rem' }}><span style={{ color: '#f43f5e' }}>return</span> <span style={{ color: '#34d399' }}>"Ready for Part 3 Sandbox Integration"</span></div>
          </div>
        </div>

        {/* Output Console / Test Runner Placeholder */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ background: '#1e293b', color: '#94a3b8', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Terminal size={16} color="#34d399" />
              <span>Execution Output &amp; Test Cases</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#334155', color: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              Sandboxed
            </span>
          </div>

          <div style={{ background: '#020617', color: '#34d399', padding: 'var(--space-6)', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
            <div style={{ color: '#94a3b8' }}>[Virtual Labs Engine v1.0.0]</div>
            <div style={{ color: '#38bdf8' }}>Session initialized for user: {userName} (lab: {labId})</div>
            <div style={{ color: '#f59e0b' }}>&gt; Waiting for execution command...</div>
            <br />
            <div style={{ color: '#64748b' }}>// Test results and execution logs will appear here</div>
            <div style={{ color: '#64748b' }}>// Automatic grading and webhook report dispatch to KaushalAI main site: Part 5</div>
          </div>
        </div>
      </div>
    </div>
  );
}
