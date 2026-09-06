import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  Code2,
  Database,
  Server,
  Globe,
  Cpu,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  ExternalLink,
  Layers,
  Lock,
  Trophy,
  Filter,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { getServiceInfo, LAB_TOKEN_STORAGE_KEY } from '../services/api';

const COMPLETED_LABS_KEY = 'kaushalai_completed_labs';

// ─── Lab Catalog ─────────────────────────────────────────────────────────────
const LABS_CATALOG = [
  {
    id: 'lab-sql-employees',
    title: 'Government Personnel Records & Department Queries',
    type: 'SQL (SQLite WebAssembly)',
    language: 'SQL',
    icon: Database,
    iconColor: '#34d399',
    badgeColor: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    badgeText: '#065f46',
    category: 'Data Analytics & Official Records',
    duration: '35 mins',
    level: 'Beginner',
    locked: false,
    description:
      'Practice real-world SQL querying against an in-browser SQLite database containing MoSPI cadre personnel records. Filter departments, compute aggregates, and extract high-salary postings.',
    competencies: ['SQL Data Extraction', 'Cadre Record Management', 'Relational Filtering']
  },
  {
    id: 'lab-python-basics',
    title: 'Statistical Data Cleaning & Analysis with Python',
    type: 'Python 3.11 (Pyodide WebAssembly)',
    language: 'Python',
    icon: Code2,
    iconColor: '#38bdf8',
    badgeColor: '#f0f9ff',
    badgeBorder: '#bae6fd',
    badgeText: '#0c4a6e',
    category: 'Official Statistical Computing',
    duration: '30 mins',
    level: 'Beginner',
    locked: false,
    description:
      'Clean raw microdata, impute missing values, and calculate census totals entirely inside the browser using Pyodide WebAssembly without sending raw data to external servers.',
    competencies: ['Python Data Manipulation', 'Microdata Cleaning', 'Statistical Aggregation']
  },
  {
    id: 'lab-sql-districts',
    title: 'District Survey Statistics & Population Analysis',
    type: 'SQL (SQLite WebAssembly)',
    language: 'SQL',
    icon: Database,
    iconColor: '#a78bfa',
    badgeColor: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    badgeText: '#5b21b6',
    category: 'Census & Demographics',
    duration: '45 mins',
    level: 'Intermediate',
    locked: false,
    description:
      'Analyze nationwide district-level census metrics using SQL GROUP BY, HAVING, and multi-column aggregate projections with automated assertion checks.',
    competencies: ['Demographic Projections', 'SQL Aggregations', 'Survey Grouping']
  },
  {
    id: 'lab-python-advanced',
    title: 'Time-Series Forecasting & Trend Analysis',
    type: 'Python 3.11 (Pyodide WebAssembly)',
    language: 'Python',
    icon: Code2,
    iconColor: '#fb923c',
    badgeColor: '#fff7ed',
    badgeBorder: '#fed7aa',
    badgeText: '#7c2d12',
    category: 'Forecasting & Analytics',
    duration: '50 mins',
    level: 'Advanced',
    locked: true,
    description:
      'Use NumPy and Pandas to forecast future population trends from historical census data series. Identify seasonal patterns and generate visual summary tables.',
    competencies: ['Time Series Analysis', 'Pandas Forecasting', 'Statistical Modeling']
  }
];

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'all', label: 'All Labs', icon: Layers },
  { id: 'Python', label: 'Python', icon: Code2 },
  { id: 'SQL', label: 'SQL', icon: Database },
  { id: 'completed', label: 'Completed', icon: Trophy }
];

export default function LabsHome() {
  const navigate = useNavigate();
  const [serviceInfo, setServiceInfo] = useState(null);
  const [launchingLabId, setLaunchingLabId] = useState(null);
  const [completedLabIds, setCompletedLabIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:3000';

  useEffect(() => {
    getServiceInfo()
      .then((data) => setServiceInfo(data))
      .catch((err) => console.warn('Could not load service info:', err.message));
  }, []);

  // Load completed labs from localStorage (persists across sessions for demo)
  useEffect(() => {
    const loadCompleted = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(COMPLETED_LABS_KEY) || '[]');
        setCompletedLabIds(Array.isArray(stored) ? stored : []);
      } catch (e) {
        setCompletedLabIds([]);
      }
    };
    loadCompleted();
    // Re-sync when tab regains focus (user returning from a lab)
    window.addEventListener('focus', loadCompleted);
    return () => window.removeEventListener('focus', loadCompleted);
  }, []);

  // Derived stats
  const totalLabs = LABS_CATALOG.length;
  const completedCount = LABS_CATALOG.filter((l) => completedLabIds.includes(l.id)).length;
  const progressPercent = Math.round((completedCount / totalLabs) * 100);

  // Filtered catalog
  const filteredLabs = LABS_CATALOG.filter((lab) => {
    if (activeFilter === 'completed') return completedLabIds.includes(lab.id);
    if (activeFilter === 'Python') return lab.language === 'Python';
    if (activeFilter === 'SQL') return lab.language === 'SQL';
    return true;
  });

  // One-click demo launcher
  const handleLaunchLab = async (lab) => {
    if (lab.locked) {
      alert(`"${lab.title}" will be unlocked after completing earlier labs. Try a Beginner lab first!`);
      return;
    }
    setLaunchingLabId(lab.id);
    try {
      const res = await fetch(`http://localhost:5001/api/lab-session/demo-token?lab_id=${lab.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem(LAB_TOKEN_STORAGE_KEY, data.token);
          navigate(`/lab/${lab.id}?token=${data.token}`);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend demo-token fallback:', e);
    }
    navigate(`/lab/${lab.id}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative orb */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, marginBottom: 'var(--space-4)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <Sparkles size={14} color="#34d399" />
          <span>Interactive Browser Sandboxes • Zero Compute Backend Cost</span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 'var(--space-3)' }}>
          KaushalAI Virtual Labs Workbench
        </h1>

        <p style={{ color: '#c7d2fe', fontSize: '1.05rem', maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
          Dedicated interactive coding sandbox environment for civil service personnel and statistical officers.
          Runs Python (Pyodide) and SQL (SQLite) directly inside your browser via WebAssembly with zero backend compute overhead.
        </p>

        {/* Live System Metrics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Server size={16} color="#818cf8" />
            <span style={{ color: '#a5b4fc' }}>Labs Service:</span>
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#34d399' }}>
              {serviceInfo ? `${serviceInfo.service} (v${serviceInfo.version})` : 'Online (Port 5001)'}
            </code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Globe size={16} color="#34d399" />
            <span style={{ color: '#a5b4fc' }}>Main Platform:</span>
            <a href={`${mainAppUrl}/dashboard`} style={{ color: '#93c5fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              KaushalAI <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Zap size={16} color="#fbbf24" />
            <span style={{ color: '#a5b4fc' }}>WASM Compute:</span>
            <span style={{ color: '#fde047', fontWeight: 600 }}>100% Client-Side</span>
          </div>
        </div>
      </div>

      {/* ── Progress Stats Header ─────────────────────────────────────────── */}
      <div
        className="card"
        style={{ padding: 'var(--space-5) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', background: '#ffffff', border: '1px solid #e2e8f0' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: completedCount === totalLabs ? '#dcfce7' : '#eff6ff', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <Trophy size={20} color={completedCount === totalLabs ? '#16a34a' : '#3b82f6'} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-900)', lineHeight: 1 }}>
                {completedCount} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '1rem' }}>/ {totalLabs}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Labs Completed</div>
            </div>
          </div>

          {/* Mini progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 160 }}>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: completedCount === totalLabs
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #4f46e5, #818cf8)',
                  borderRadius: '999px',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
              {progressPercent}% overall progress
            </span>
          </div>
        </div>

        {/* Quick stats pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Python Labs', count: LABS_CATALOG.filter(l => l.language === 'Python').length, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'SQL Labs', count: LABS_CATALOG.filter(l => l.language === 'SQL').length, color: '#059669', bg: '#ecfdf5' },
            { label: 'Completed', count: completedCount, color: '#7c3aed', bg: '#f5f3ff' }
          ].map(({ label, count, color, bg }) => (
            <div
              key={label}
              style={{ background: bg, color, fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '999px', border: `1px solid ${color}22` }}
            >
              {count} {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Tabs + Lab Cards ───────────────────────────────────────── */}
      <div>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} color="#64748b" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Filter:</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {FILTERS.map(({ id, label, icon: Icon }) => {
              const isActive = activeFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveFilter(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    border: isActive ? '1.5px solid #4f46e5' : '1.5px solid #e2e8f0',
                    background: isActive ? '#ede9fe' : '#ffffff',
                    color: isActive ? '#4f46e5' : '#64748b',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={13} />
                  {label}
                  {id === 'completed' && completedCount > 0 && (
                    <span style={{ background: '#4f46e5', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0 0.35rem', borderRadius: '999px', minWidth: '16px', textAlign: 'center' }}>
                      {completedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>
            {filteredLabs.length} lab{filteredLabs.length !== 1 ? 's' : ''} shown
          </span>
        </div>

        {/* Empty state */}
        {filteredLabs.length === 0 && (
          <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
            <Trophy size={36} color="#cbd5e1" style={{ display: 'block', margin: '0 auto var(--space-3)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
              {activeFilter === 'completed' ? 'No labs completed yet' : 'No labs match this filter'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              {activeFilter === 'completed'
                ? 'Launch any sandbox below and complete all tasks to see your progress here.'
                : 'Try selecting a different filter above.'}
            </p>
            {activeFilter === 'completed' && (
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="btn btn-primary"
                style={{ marginTop: 'var(--space-4)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
              >
                <Layers size={14} />
                View All Labs
              </button>
            )}
          </div>
        )}

        {/* Lab Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredLabs.map((lab) => {
            const Icon = lab.icon;
            const isLaunching = launchingLabId === lab.id;
            const isCompleted = completedLabIds.includes(lab.id);

            return (
              <div
                key={lab.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: 'var(--space-6)',
                  border: isCompleted
                    ? '1.5px solid #86efac'
                    : lab.locked
                    ? '1.5px dashed #cbd5e1'
                    : '1px solid #e2e8f0',
                  boxShadow: isCompleted
                    ? '0 4px 12px rgba(16, 185, 129, 0.1)'
                    : lab.locked
                    ? 'none'
                    : '0 4px 6px -1px rgba(0,0,0,0.05)',
                  background: lab.locked ? '#fafafa' : '#ffffff',
                  opacity: lab.locked ? 0.78 : 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Completed ribbon */}
                {isCompleted && (
                  <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderBottomLeftRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={11} />
                    COMPLETED
                  </div>
                )}

                {/* Locked badge */}
                {lab.locked && !isCompleted && (
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                    <Lock size={11} />
                    Locked
                  </div>
                )}

                <div>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ background: lab.badgeColor, border: `1px solid ${lab.badgeBorder}`, padding: '0.45rem', borderRadius: '8px', display: 'flex', filter: lab.locked ? 'grayscale(0.5)' : 'none' }}>
                        <Icon size={20} color={lab.iconColor} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: lab.badgeColor, color: lab.badgeText, border: `1px solid ${lab.badgeBorder}`, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                        {lab.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      {lab.duration} • {lab.level}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.025rem', fontWeight: 700, color: lab.locked ? '#94a3b8' : 'var(--color-primary-900)', marginBottom: 'var(--space-2)' }}>
                    {lab.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, marginBottom: 'var(--space-4)' }}>
                    {lab.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: 'var(--space-5)' }}>
                    {lab.competencies.map((comp, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          padding: '0.15rem 0.45rem',
                          background: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 'var(--space-4)' }}>
                  {isCompleted ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleLaunchLab(lab)}
                        disabled={isLaunching}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '1px solid #86efac', color: '#065f46', background: '#f0fdf4' }}
                      >
                        <Play size={13} />
                        Practice Again
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#15803d', fontSize: '0.8rem', fontWeight: 700, padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #86efac' }}>
                        <CheckCircle2 size={14} />
                        100%
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLaunchLab(lab)}
                      disabled={isLaunching}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.55rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        background: lab.locked
                          ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                          : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                        boxShadow: lab.locked ? 'none' : '0 2px 4px rgba(79, 70, 229, 0.2)'
                      }}
                    >
                      {lab.locked ? <Lock size={14} /> : <Play size={15} />}
                      <span>
                        {isLaunching
                          ? 'Launching Sandbox...'
                          : lab.locked
                          ? 'Unlock After Earlier Labs'
                          : 'Launch Interactive Sandbox'}
                      </span>
                      {!lab.locked && <ArrowRight size={14} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Architecture Highlights Banner ───────────────────────────────── */}
      <div className="card" style={{ padding: 'var(--space-6)', background: '#fafaf9', border: '1px solid #e7e5e4' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c1917', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="#4f46e5" />
          <span>Virtual Labs Architecture &amp; Key Design Principles</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {[
            { icon: Zap, iconColor: '#eab308', title: 'Zero Backend Compute', desc: 'Code executes 100% client-side via Pyodide and sql.js WebAssembly. No arbitrary code execution risks or compute server bills.' },
            { icon: ShieldCheck, iconColor: '#10b981', title: 'Cryptographic Token Scope', desc: 'The labs app trusts short-lived signed JWTs issued exclusively by KaushalAI after quiz completion.' },
            { icon: CheckCircle2, iconColor: '#3b82f6', title: 'Completion Webhooks', desc: 'When learners complete 100% of tasks, a server-to-server webhook updates official employee records on KaushalAI.' },
            { icon: BarChart3, iconColor: '#8b5cf6', title: 'Persistent Progress', desc: 'Demo progress is persisted to localStorage across browser sessions, so completion badges survive refreshes and re-visits.' }
          ].map(({ icon: Icon, iconColor, title, desc }) => (
            <div key={title} style={{ background: '#ffffff', padding: 'var(--space-4)', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Icon size={15} color={iconColor} />
                <span>{title}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Site Link-Up CTA ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6) var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          color: '#fff'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <BookOpen size={18} color="#818cf8" />
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Ready to earn your course certificate?</span>
          </div>
          <p style={{ color: '#c7d2fe', fontSize: '0.875rem', margin: 0 }}>
            Complete labs here and your progress will sync automatically to KaushalAI — unlocking your course badge and performance report.
          </p>
        </div>
        <a
          href={`${mainAppUrl}/dashboard`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            color: '#ffffff',
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            backdropFilter: 'blur(4px)'
          }}
        >
          <ExternalLink size={15} />
          Go to KaushalAI Dashboard
        </a>
      </div>
    </div>
  );
}

