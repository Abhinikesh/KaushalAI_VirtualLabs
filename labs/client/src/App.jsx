import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LabsHome from './pages/LabsHome';
import LabRunner from './pages/LabRunner';

export default function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LabsHome />} />
          <Route path="/lab/:labId" element={<LabRunner />} />
          <Route
            path="*"
            element={
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>404 - Page Not Found</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                  The requested lab page does not exist.
                </p>
                <a href="/" className="btn btn-primary">Return to Labs Home</a>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
