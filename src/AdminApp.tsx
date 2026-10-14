import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Lock, Eye, EyeOff, ArrowRight, Store } from 'lucide-react';

const AUTH_STORAGE_KEY = 'the_full_cart_admin_auth_v1';
const DEFAULT_ADMIN_PASS = 'admin123';

export const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL query param for quick access e.g. ?pass=admin123
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passParam = params.get('pass') || params.get('pin');
    if (passParam === DEFAULT_ADMIN_PASS) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    // Check password
    if (passwordInput.trim() === DEFAULT_ADMIN_PASS) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Admin Password. Default is: admin123');
    }
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // If authenticated, show full Admin Dashboard
  if (isAuthenticated) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <AdminDashboard onLogout={handleLogout} />
      </div>
    );
  }

  // Otherwise, show sleek Secure Admin Login Screen
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), #0a0e17',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15)',
        backdropFilter: 'blur(20px)',
      }}>
        
        {/* Brand Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)',
          }}>
            <img
              src="/logo.png"
              alt="The Full Cart"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#0a0e17',
              }}
            />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}>
              SECURE ADMIN PORTAL
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
            Store Manager Sign In
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Please enter your management password to access orders, stock, and settings.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Admin Password</span>
              <span style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 600 }}>
                Default: <strong>admin123</strong>
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-input"
                style={{ padding: '12px 42px 12px 38px', fontSize: '0.95rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--text-dim)',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              padding: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              width: '100%',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
            }}
          >
            <span>Access Admin Hub</span>
            <ArrowRight size={17} />
          </button>

          {/* Quick autofill helper for store owner convenience */}
          <button
            type="button"
            onClick={() => {
              setPasswordInput(DEFAULT_ADMIN_PASS);
            }}
            style={{
              background: 'transparent',
              color: 'var(--text-dim)',
              fontSize: '0.78rem',
              textAlign: 'center',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Fill Default Password ({DEFAULT_ADMIN_PASS})
          </button>
        </form>

        {/* Footer Link to Customer Storefront */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              color: '#38bdf8',
              fontWeight: 600,
            }}
          >
            <Store size={15} />
            <span>← Return to Live Customer Storefront</span>
          </a>
        </div>

      </div>
    </div>
  );
};
