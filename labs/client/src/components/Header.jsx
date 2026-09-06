import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Header() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  useEffect(() => {
    let isMounted = true;

    const verifyBackend = async () => {
      try {
        const data = await checkHealth();
        if (isMounted && data?.status === 'ok') {
          setBackendStatus('online');
        } else if (isMounted) {
          setBackendStatus('offline');
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('offline');
        }
      }
    };

    verifyBackend();
    const intervalId = setInterval(verifyBackend, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="header-brand">
          <div className="brand-logo-icon">
            <Terminal size={20} strokeWidth={2.5} />
          </div>
          <div className="brand-text-container">
            <div className="brand-title">
              KaushalAI
              <span className="badge-labs">Virtual Labs</span>
            </div>
            <span className="brand-subtitle">Interactive Execution Environment</span>
          </div>
        </Link>

        <nav className="header-nav">
          <div className="status-pill" title={`Backend status: ${backendStatus}`}>
            <span className={`status-dot ${backendStatus}`} />
            <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
              Backend: {backendStatus}
            </span>
          </div>

          <Link to="/" className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Layers size={14} />
            All Labs
          </Link>
        </nav>
      </div>
    </header>
  );
}
