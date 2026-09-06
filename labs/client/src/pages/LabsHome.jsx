import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle2, Code2, Server, Globe, Cpu, ArrowRight } from 'lucide-react';
import { getServiceInfo } from '../services/api';

export default function LabsHome() {
  const [serviceInfo, setServiceInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServiceInfo()
      .then((data) => setServiceInfo(data))
      .catch((err) => console.warn('Could not load service info:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const sampleLabs = [
    {
      id: 'lab-python-basics',
      title: 'Python Scripting Fundamentals',
      category: 'Data Science & Scripting',
      duration: '30 mins',
      level: 'Beginner'
    },
    {
      id: 'lab-sql-analytics',
      title: 'PostgreSQL Query Optimization',
      category: 'Database Management',
      duration: '45 mins',
      level: 'Intermediate'
    },
    {
      id: 'lab-react-components',
      title: 'React Stateful Component Engineering',
      category: 'Web Development',
      duration: '40 mins',
      level: 'Intermediate'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Hero / Overview Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8) var(--space-8)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, marginBottom: 'var(--space-4)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <CheckCircle2 size={14} color="#34d399" />
          Part 1: Project Setup & Infrastructure Active
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 'var(--space-2)' }}>
          KaushalAI Virtual Labs
        </h1>
        <p style={{ color: '#c7d2fe', fontSize: '1rem', maxWidth: '650px', lineHeight: 1.6 }}>
          Dedicated interactive coding sandbox environment. This standalone application executes student code safely, tests competencies, and reports progress back to the main KaushalAI platform.
        </p>

        {/* System Info Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Server size={16} color="#818cf8" />
            <span style={{ color: '#a5b4fc' }}>Backend API:</span>
            <code style={{ background: 'rgba(0,0,0,0.25)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
              {serviceInfo ? `${serviceInfo.service} (v${serviceInfo.version})` : 'Connecting...'}
            </code>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <Globe size={16} color="#34d399" />
            <span style={{ color: '#a5b4fc' }}>Frontend Client:</span>
            <code style={{ background: 'rgba(0,0,0,0.25)', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
              React + Vite (Single Page App)
            </code>
          </div>
        </div>
      </div>

      {/* Part 1 Status Checklist */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="var(--color-primary-600)" />
          Part 1 Scaffolding Architecture
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-primary-900)', marginBottom: '0.25rem' }}>
              Client Application (client/)
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              React 18, Vite bundler, React Router v6, Axios API layer, and KaushalAI design tokens.
            </p>
          </div>
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-primary-900)', marginBottom: '0.25rem' }}>
              Server Application (server/)
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Express.js, Helmet security, restricted CORS, Mongoose DB connection to isolated <code>kaushalai_labs</code>.
            </p>
          </div>
          <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-primary-900)', marginBottom: '0.25rem' }}>
              Part 2-7 Roadmap
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Part 2: JWT Auth & Main App Webhooks | Parts 3-4: Code Execution Sandbox | Part 6: Full Lab Dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Available Labs / Sample Routes Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Sample Lab Workspaces
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Click any lab to verify route parameter handling in the Lab Runner (<code>/lab/:labId</code>)
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {sampleLabs.map((lab) => (
            <div key={lab.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)', background: 'var(--color-primary-50)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {lab.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {lab.duration}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>
                  {lab.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Interactive hands-on sandbox exercise testing core practical competencies.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Level: <strong>{lab.level}</strong>
                </span>
                <Link to={`/lab/${lab.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}>
                  <Play size={13} />
                  Launch Sandbox
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
