import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Database,
  Server,
  Globe,
  Zap,
  ExternalLink,
  Layers,
  Filter,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BookOpen,
  FileSpreadsheet,
  Search,
  Play,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getServiceInfo, getLabsList } from '../services/api';

// Filter tabs for the catalog
const FILTERS = [
  { id: 'all', label: 'All Labs', icon: Layers },
  { id: 'python', label: 'Python', icon: Code2 },
  { id: 'sql', label: 'SQL', icon: Database },
  { id: 'javascript', label: 'JavaScript', icon: Code2 },
  { id: 'html_css', label: 'HTML/CSS', icon: Globe },
  { id: 'spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet },
  { id: 'regex', label: 'Regex & Text', icon: Search }
];

export default function LabsHome() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serviceInfo, setServiceInfo] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:3000';

  const fetchLabsCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLabsList();
      setLabs(Array.isArray(data.labs) ? data.labs : []);
    } catch (err) {
      console.error('Failed to load labs catalog:', err);
      setError(err.response?.data?.message || 'Could not connect to labs service. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabsCatalog();
    getServiceInfo()
      .then((data) => setServiceInfo(data))
      .catch((err) => console.warn('Could not load service info:', err.message));
  }, []);

  // Filtered catalog list
  const filteredLabs = labs.filter((lab) => {
    if (activeFilter === 'python') return lab.type === 'python_sandbox';
    if (activeFilter === 'sql') return lab.type === 'sql_sandbox';
    if (activeFilter === 'javascript') return lab.type === 'js_sandbox';
    if (activeFilter === 'html_css') return lab.type === 'html_css_sandbox';
    if (activeFilter === 'spreadsheet') return lab.type === 'spreadsheet_sandbox';
    if (activeFilter === 'regex') return lab.type === 'regex_sandbox';
    return true;
  });

  const pythonCount = labs.filter((l) => l.type === 'python_sandbox').length;
  const sqlCount = labs.filter((l) => l.type === 'sql_sandbox').length;
  const jsCount = labs.filter((l) => l.type === 'js_sandbox').length;
  const htmlCssCount = labs.filter((l) => l.type === 'html_css_sandbox').length;
  const spreadsheetCount = labs.filter((l) => l.type === 'spreadsheet_sandbox').length;
  const regexCount = labs.filter((l) => l.type === 'regex_sandbox').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Top Notice: Active Standalone & Course Integration Banner ──────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
          border: '1px solid #c7d2fe',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 10px rgba(99, 102, 241, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Interactive Virtual Labs Active</span>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                ● Ready to Practice
              </span>
            </div>
            <div style={{ color: '#4338ca', fontSize: '0.84rem', marginTop: '0.15rem' }}>
              Launch any lab directly below to practice code execution, formulas, queries, and text validation in your browser.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a
            href={`${mainAppUrl}/dashboard`}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #c7d2fe',
              background: '#ffffff',
              color: '#3730a3'
            }}
          >
            <BookOpen size={14} />
            <span>KaushalAI Course Hub</span>
            <ExternalLink size={12} color="#818cf8" />
          </a>
        </div>
      </div>

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          borderRadius: '20px',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)',
            padding: '0.3rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '1rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <Zap size={14} color="#fde047" />
          <span>Zero Server Compute • Real-Time Client WebAssembly & Sandboxing</span>
        </div>

        <h1
          style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            marginBottom: '0.75rem',
            lineHeight: 1.25
          }}
        >
          KaushalAI Virtual Labs Workbench
        </h1>

        <p
          style={{
            color: '#c7d2fe',
            fontSize: '0.98rem',
            maxWidth: '820px',
            lineHeight: 1.6,
            margin: 0
          }}
        >
          Dedicated interactive sandbox environment for government civil servants, data analysts, and technical personnel.
          Execute Python (Pyodide), SQLite (WASM), modern JavaScript, HTML/CSS, Spreadsheets (Formulas), and Regex text cleaning directly with instant automated verification.
        </p>

        {/* Live System Metrics */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Server size={16} color="#818cf8" />
            <span style={{ color: '#a5b4fc' }}>Backend API:</span>
            <code style={{ background: 'rgba(0,0,0,0.35)', padding: '0.15rem 0.5rem', borderRadius: '6px', color: '#34d399', fontWeight: 600 }}>
              {serviceInfo ? `${serviceInfo.service} (Online)` : 'Connected (Port 5001)'}
            </code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Globe size={16} color="#34d399" />
            <span style={{ color: '#a5b4fc' }}>LMS Integration:</span>
            <span style={{ color: '#93c5fd', fontWeight: 500 }}>
              Dual SSO + Standalone Practice
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Zap size={16} color="#fbbf24" />
            <span style={{ color: '#a5b4fc' }}>Engines:</span>
            <span style={{ color: '#fde047', fontWeight: 600 }}>6 Sandboxes Supported</span>
          </div>
        </div>
      </div>

      {/* ── Catalog Stats Bar ────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '10px', display: 'flex', color: '#3b82f6' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary-900)', lineHeight: 1.1 }}>
              {labs.length} Practical Sandbox Labs
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Curated hands-on modules ready for immediate execution
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span className="stat-tag python">{pythonCount} Python</span>
          <span className="stat-tag sql">{sqlCount} SQL</span>
          <span className="stat-tag js">{jsCount} JavaScript</span>
          <span className="stat-tag html">{htmlCssCount} HTML/CSS</span>
          <span className="stat-tag sheet">{spreadsheetCount} Spreadsheet</span>
          <span className="stat-tag regex">{regexCount} Regex & Text</span>
        </div>
      </div>

      {/* ── Filter Tabs + Catalog Grid ───────────────────────────────────── */}
      <div>
        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} color="#64748b" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Filter By:</span>
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
                    padding: '0.4rem 0.9rem',
                    borderRadius: '999px',
                    border: isActive ? '1.5px solid #4f46e5' : '1.5px solid #e2e8f0',
                    background: isActive ? '#ede9fe' : '#ffffff',
                    color: isActive ? '#4f46e5' : '#475569',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredLabs.length} of {labs.length} labs
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="lab-card-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="lab-card"
                style={{
                  height: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ width: '40%', height: 22, background: '#e2e8f0', borderRadius: 6 }} />
                <div style={{ width: '80%', height: 26, background: '#e2e8f0', borderRadius: 6 }} />
                <div style={{ width: '100%', height: 60, background: '#e2e8f0', borderRadius: 6 }} />
                <div style={{ marginTop: 'auto', width: '100%', height: 42, background: '#e2e8f0', borderRadius: 10 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              borderRadius: '16px'
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}
            >
              <AlertCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
              Failed to Connect to Backend Catalog
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#b91c1c', maxWidth: 520, margin: '0 auto 1.25rem' }}>
              {error}
            </p>
            <button
              type="button"
              onClick={fetchLabsCatalog}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', borderRadius: '8px' }}
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && !error && filteredLabs.length === 0 && (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
            <Layers size={36} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
              No labs found for filter "{activeFilter}"
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Select "All Labs" to view all available interactive sandboxes.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="btn btn-secondary"
              style={{ marginTop: '1rem', borderRadius: '8px' }}
            >
              View All Labs
            </button>
          </div>
        )}

        {/* ── Labs Cards Grid ────────────────────────────────────────────── */}
        {!loading && !error && filteredLabs.length > 0 && (
          <div className="lab-card-grid">
            {filteredLabs.map((lab) => {
              const isSql = lab.type === 'sql_sandbox';
              const isJs = lab.type === 'js_sandbox';
              const isHtmlCss = lab.type === 'html_css_sandbox';
              const isSpreadsheet = lab.type === 'spreadsheet_sandbox';
              const isRegex = lab.type === 'regex_sandbox';

              const cardTypeClass = isSql
                ? 'type-sql'
                : isJs
                ? 'type-js'
                : isHtmlCss
                ? 'type-html'
                : isSpreadsheet
                ? 'type-sheet'
                : isRegex
                ? 'type-regex'
                : 'type-python';

              const Icon = isSql
                ? Database
                : isJs
                ? Code2
                : isHtmlCss
                ? Globe
                : isSpreadsheet
                ? FileSpreadsheet
                : isRegex
                ? Search
                : Code2;

              const typeLabel = isSql
                ? 'SQL (SQLite WASM)'
                : isJs
                ? 'JavaScript Sandbox'
                : isHtmlCss
                ? 'HTML/CSS Sandbox'
                : isSpreadsheet
                ? 'Spreadsheet & Formulas'
                : isRegex
                ? 'Regex & Text Processing'
                : 'Python 3.11 (Pyodide)';

              const badgeColor = isSql ? '#ecfdf5' : isJs ? '#fefce8' : isHtmlCss ? '#f0fdfa' : isSpreadsheet ? '#f0fdf4' : isRegex ? '#faf5ff' : '#f0f9ff';
              const badgeBorder = isSql ? '#a7f3d0' : isJs ? '#fde047' : isHtmlCss ? '#99f6e4' : isSpreadsheet ? '#86efac' : isRegex ? '#d8b4fe' : '#bae6fd';
              const badgeText = isSql ? '#065f46' : isJs ? '#b45309' : isHtmlCss ? '#0f766e' : isSpreadsheet ? '#166534' : isRegex ? '#7e22ce' : '#0369a1';
              const iconColor = isSql ? '#059669' : isJs ? '#d97706' : isHtmlCss ? '#0d9488' : isSpreadsheet ? '#15803d' : isRegex ? '#9333ea' : '#0284c7';

              return (
                <div
                  key={lab.lab_id}
                  className={`lab-card ${cardTypeClass}`}
                >
                  <div>
                    {/* Header: Type and Metadata */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div
                          style={{
                            background: badgeColor,
                            border: `1px solid ${badgeBorder}`,
                            padding: '0.35rem',
                            borderRadius: '8px',
                            display: 'flex'
                          }}
                        >
                          <Icon size={16} color={iconColor} />
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: badgeColor,
                            color: badgeText,
                            border: `1px solid ${badgeBorder}`,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px'
                          }}
                        >
                          {typeLabel}
                        </span>
                      </div>

                      {/* Top Right Difficulty & Duration Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '999px',
                            background: lab.difficulty === 'Intermediate' ? '#fffbeb' : '#f0fdf4',
                            color: lab.difficulty === 'Intermediate' ? '#b45309' : '#15803d',
                            border: lab.difficulty === 'Intermediate' ? '1px solid #fde68a' : '1px solid #bbf7d0'
                          }}
                        >
                          {lab.difficulty || 'Beginner'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '999px',
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          <Clock size={10} />
                          {lab.estimated_minutes || 15}m
                        </span>
                      </div>
                    </div>

                    <h3 className="lab-card-title">
                      {lab.title}
                    </h3>

                    <p className="lab-card-desc">
                      {lab.description}
                    </p>

                    {/* Competency tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      {(lab.competency_tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 500,
                            padding: '0.15rem 0.45rem',
                            background: '#f8fafc',
                            color: '#475569',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Direct Launch Button & Course reference */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                    <Link
                      to={`/lab/${lab.lab_id}`}
                      className="btn-start-lab"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Start Lab</span>
                      <ArrowRight size={14} />
                    </Link>

                    {lab.course_title && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          fontSize: '0.72rem',
                          color: '#64748b',
                          marginTop: '0.5rem',
                          textAlign: 'center',
                          lineHeight: 1.3
                        }}
                      >
                        <BookOpen size={11} color="#94a3b8" />
                        <span>Aligned with <strong>{lab.course_title}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
