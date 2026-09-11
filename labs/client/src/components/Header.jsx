import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { checkHealth } from '../services/api';

import logoImg from '../assets/logo.png';

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
        <Link to="/" className="header-brand" title="KaushalLab Virtual Labs Workbench">
          <img
            src={logoImg}
            alt="KaushalLab Logo"
            className="brand-logo-img"
          />
          <div className="brand-text-container">
            <span className="badge-labs" style={{ width: 'fit-content' }}>
              Virtual Labs
            </span>
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
