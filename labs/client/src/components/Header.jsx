import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Header() {
  return (
    <header className="header-container">
      <div className="header-content">
        <Link to="/" className="header-brand" title="KaushalLab Virtual Labs">
          <img
            src={logoImg}
            alt="KaushalLab Logo"
            className="brand-logo-img"
          />
          <div className="brand-text-container">
            <span className="brand-subtitle">Interactive Execution Environment</span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/" className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            <Layers size={14} />
            All Labs
          </Link>
        </nav>
      </div>
    </header>
  );
}
