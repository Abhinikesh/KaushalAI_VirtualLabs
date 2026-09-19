import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Database,
  Globe,
  Layers,
  Filter,
  FileSpreadsheet,
  Search,
  Play,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { getLabsList } from '../services/api';
import { STATIC_LABS } from '../data/staticLabs';

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
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchLabsCatalog = async () => {
    setLoading(true);
    try {
      const data = await getLabsList();
      const apiLabs = Array.isArray(data.labs) ? data.labs : [];
      setLabs(apiLabs.length > 0 ? apiLabs : STATIC_LABS);
    } catch {
      setLabs(STATIC_LABS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabsCatalog();
  }, []);

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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f4ff 0%, #eaedff 60%, #f3f0ff 100%)',
          borderRadius: '18px',
          padding: '2.25rem 2.5rem',
          border: '1px solid #dde3f5',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#1e1b4b',
            marginBottom: '0.55rem',
            lineHeight: 1.2
          }}
        >
          Practice Labs
        </h1>

        <p
          style={{
            color: '#4b5563',
            fontSize: '1rem',
            maxWidth: '640px',
            lineHeight: 1.65,
            margin: '0 0 1.75rem 0'
          }}
        >
          Hands-on coding exercises for Python, SQL, JavaScript, HTML/CSS, Spreadsheets and Regex.
          Write code, run it instantly in your browser, and see results — no setup needed.
        </p>

        {/* Language tags */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Python', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'SQL', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
            { label: 'JavaScript', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'HTML / CSS', color: '#ef4444', bg: '#fff1f2', border: '#fecdd3' },
            { label: 'Spreadsheet', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
            { label: 'Regex', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
          ].map(({ label, color, bg, border }) => (
            <span
              key={label}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color,
                background: bg,
                border: `1px solid ${border}`,
                padding: '0.25rem 0.75rem',
                borderRadius: '6px'
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Catalog Stats Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e8edf5'
        }}
      >
        <div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b' }}>
            {labs.length} Labs
          </span>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '0.5rem', fontWeight: 400 }}>
            available to practice
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="stat-tag python">{pythonCount} Python</span>
          <span className="stat-tag sql">{sqlCount} SQL</span>
          <span className="stat-tag js">{jsCount} JavaScript</span>
          <span className="stat-tag html">{htmlCssCount} HTML/CSS</span>
          <span className="stat-tag sheet">{spreadsheetCount} Spreadsheet</span>
          <span className="stat-tag regex">{regexCount} Regex</span>
        </div>
      </div>

      {/* ── Filter Tabs + Catalog Grid ────────────────────────────────────── */}
      <div>
        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
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
                    padding: '0.38rem 0.85rem',
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

          <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
            {filteredLabs.length} of {labs.length} labs
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="lab-card-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="lab-card"
                style={{ height: 280, display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <div style={{ width: '40%', height: 22, background: '#e2e8f0', borderRadius: 6 }} />
                <div style={{ width: '80%', height: 26, background: '#e2e8f0', borderRadius: 6 }} />
                <div style={{ width: '100%', height: 60, background: '#e2e8f0', borderRadius: 6 }} />
                <div style={{ marginTop: 'auto', width: '100%', height: 42, background: '#e2e8f0', borderRadius: 10 }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && filteredLabs.length === 0 && (
          <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
            <Layers size={36} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary-900)' }}>
              No labs in this category
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              Select "All Labs" to view all available exercises.
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

        {/* ── Labs Cards Grid ──────────────────────────────────────────────── */}
        {!loading && filteredLabs.length > 0 && (
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

              const Icon = isSql ? Database : isJs ? Code2 : isHtmlCss ? Globe : isSpreadsheet ? FileSpreadsheet : isRegex ? Search : Code2;

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
                    {/* Type badge row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div style={{ background: badgeColor, border: `1px solid ${badgeBorder}`, padding: '0.35rem', borderRadius: '8px', display: 'flex' }}>
                          <Icon size={15} color={iconColor} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, background: badgeColor, color: badgeText, border: `1px solid ${badgeBorder}`, padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                          {typeLabel}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.15rem 0.45rem', borderRadius: '999px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                          {lab.difficulty || 'Beginner'}
                        </span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.15rem 0.45rem', borderRadius: '999px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
                          ~{lab.estimated_minutes || 15}m
                        </span>
                      </div>
                    </div>

                    <h3 className="lab-card-title">{lab.title}</h3>
                    <p className="lab-card-desc">{lab.description}</p>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1.25rem' }}>
                      {(lab.competency_tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{ fontSize: '0.69rem', fontWeight: 500, padding: '0.15rem 0.45rem', background: '#f8fafc', color: '#475569', borderRadius: '5px', border: '1px solid #e2e8f0' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                    <Link to={`/lab/${lab.lab_id}`} className="btn-start-lab">
                      <Play size={14} fill="currentColor" />
                      <span>Start Lab</span>
                      <ArrowRight size={14} />
                    </Link>

                    {lab.course_title && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.71rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center', lineHeight: 1.3 }}>
                        <BookOpen size={11} color="#cbd5e1" />
                        <span>{lab.course_title}</span>
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
