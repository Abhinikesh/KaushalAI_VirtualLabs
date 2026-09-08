import React, { useEffect, useState } from 'react';
import {
  Code2,
  Database,
  Server,
  Globe,
  Zap,
  ExternalLink,
  Layers,
  Lock,
  Filter,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { getServiceInfo, getLabsList } from '../services/api';

// Filter tabs for the catalog
const FILTERS = [
  { id: 'all', label: 'All Labs', icon: Layers },
  { id: 'python', label: 'Python', icon: Code2 },
  { id: 'sql', label: 'SQL', icon: Database }
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
    return true;
  });

  const pythonCount = labs.filter((l) => l.type === 'python_sandbox').length;
  const sqlCount = labs.filter((l) => l.type === 'sql_sandbox').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ── Top Notice: KaushalAI Launch Flow Banner ──────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '0.95rem' }}>
              Catalog Preview Mode
            </div>
            <div style={{ color: '#1e40af', fontSize: '0.875rem' }}>
              Launch labs from your Learning Path on KaushalAI to access hands-on practice
            </div>
          </div>
        </div>

        <a
          href={`${mainAppUrl}/dashboard`}
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '0.45rem 1rem'
          }}
        >
          <span>Go to KaushalAI Learning Path</span>
          <ExternalLink size={14} />
        </a>
      </div>

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
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 220,
            height: 220,
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
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: 'var(--space-4)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <Sparkles size={14} color="#34d399" />
          <span>Interactive Browser Sandboxes • Zero Backend Compute Overhead</span>
        </div>

        <h1
          style={{
            fontSize: '2.15rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            marginBottom: 'var(--space-3)'
          }}
        >
          KaushalAI Virtual Labs Workbench
        </h1>

        <p
          style={{
            color: '#c7d2fe',
            fontSize: '1rem',
            maxWidth: '780px',
            lineHeight: 1.6,
            margin: 0
          }}
        >
          Dedicated interactive coding sandbox environment for civil service personnel and statistical officers.
          Runs Python (Pyodide) and SQL (SQLite) directly inside your browser via WebAssembly with automated task verification.
        </p>

        {/* Live System Metrics */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Server size={16} color="#818cf8" />
            <span style={{ color: '#a5b4fc' }}>Backend API:</span>
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#34d399' }}>
              {serviceInfo ? `${serviceInfo.service} (v${serviceInfo.version})` : 'Online (Port 5001)'}
            </code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Globe size={16} color="#34d399" />
            <span style={{ color: '#a5b4fc' }}>Main Platform:</span>
            <a
              href={`${mainAppUrl}/dashboard`}
              style={{ color: '#93c5fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              KaushalAI <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Zap size={16} color="#fbbf24" />
            <span style={{ color: '#a5b4fc' }}>Sandbox Engine:</span>
            <span style={{ color: '#fde047', fontWeight: 600 }}>WebAssembly (Client-Side)</span>
          </div>
        </div>
      </div>

      {/* ── Catalog Stats Bar ────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: '#eff6ff', padding: '0.45rem', borderRadius: '8px', display: 'flex' }}>
            <BookOpen size={18} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-900)', lineHeight: 1 }}>
              {labs.length} Available Sandbox Labs
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Live catalog populated directly from database
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid #bfdbfe'
            }}
          >
            {pythonCount} Python Labs
          </div>
          <div
            style={{
              background: '#ecfdf5',
              color: '#047857',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid #a7f3d0'
            }}
          >
            {sqlCount} SQL Labs
          </div>
        </div>
      </div>

      {/* ── Filter Tabs + Catalog Grid ───────────────────────────────────── */}
      <div>
        {/* Filter Controls */}
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
                </button>
              );
            })}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>
            {filteredLabs.length} lab{filteredLabs.length !== 1 ? 's' : ''} shown
          </span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 'var(--space-6)',
                  height: 240,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-4)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ width: '40%', height: 20, background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ width: '75%', height: 24, background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ width: '100%', height: 48, background: '#e2e8f0', borderRadius: 4 }} />
                <div style={{ marginTop: 'auto', width: '100%', height: 38, background: '#e2e8f0', borderRadius: 6 }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            className="card"
            style={{
              padding: 'var(--space-8)',
              textAlign: 'center',
              border: '1px solid #fecaca',
              background: '#fef2f2'
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
                margin: '0 auto var(--space-3)'
              }}
            >
              <AlertCircle size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
              Failed to Load Labs Catalog
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#b91c1c', maxWidth: 500, margin: '0 auto var(--space-4)' }}>
              {error}
            </p>
            <button
              type="button"
              onClick={fetchLabsCatalog}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && !error && filteredLabs.length === 0 && (
          <div className="card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
            <Layers size={36} color="#cbd5e1" style={{ display: 'block', margin: '0 auto var(--space-3)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
              No labs found in this category
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Try selecting a different filter above.
            </p>
          </div>
        )}

        {/* Lab Cards Grid */}
        {!loading && !error && filteredLabs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
            {filteredLabs.map((lab) => {
              const isSql = lab.type === 'sql_sandbox';
              const Icon = isSql ? Database : Code2;
              const typeLabel = isSql ? 'SQL (SQLite WebAssembly)' : 'Python 3.11 (Pyodide)';
              const badgeColor = isSql ? '#ecfdf5' : '#f0f9ff';
              const badgeBorder = isSql ? '#a7f3d0' : '#bae6fd';
              const badgeText = isSql ? '#065f46' : '#0c4a6e';
              const iconColor = isSql ? '#059669' : '#0284c7';

              return (
                <div
                  key={lab.lab_id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 'var(--space-6)',
                    border: '1.5px dashed #cbd5e1',
                    background: '#fafbfc',
                    boxShadow: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Top-right locked preview tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px'
                    }}
                  >
                    <Lock size={11} />
                    <span>Locked Preview</span>
                  </div>

                  <div>
                    {/* Header: Icon and Type */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-3)' }}>
                      <div
                        style={{
                          background: badgeColor,
                          border: `1px solid ${badgeBorder}`,
                          padding: '0.4rem',
                          borderRadius: '8px',
                          display: 'flex'
                        }}
                      >
                        <Icon size={18} color={iconColor} />
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: badgeColor,
                          color: badgeText,
                          border: `1px solid ${badgeBorder}`,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px'
                        }}
                      >
                        {typeLabel}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--color-primary-900)',
                        marginBottom: 'var(--space-2)'
                      }}
                    >
                      {lab.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.55,
                        marginBottom: 'var(--space-4)'
                      }}
                    >
                      {lab.description}
                    </p>

                    {/* Competency tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: 'var(--space-5)' }}>
                      {(lab.competency_tags || []).map((tag, idx) => (
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
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Launch instructions and link */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <a
                        href={`${mainAppUrl}/dashboard`}
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          padding: '0.55rem 1rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          textDecoration: 'none',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#475569'
                        }}
                      >
                        <Lock size={14} color="#64748b" />
                        <span>Launch from KaushalAI</span>
                        <ExternalLink size={12} color="#94a3b8" />
                      </a>
                      {lab.course_title && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
                          Unlocks after completing <strong>{lab.course_title}</strong>
                        </span>
                      )}
                    </div>
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
