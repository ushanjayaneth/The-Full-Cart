import React, { useState } from 'react';
import { X, Check, Database, CheckCircle2 } from 'lucide-react';
import { getDatabaseUrl, saveDatabaseUrl } from '../../services/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [dbUrl, setDbUrl] = useState<string>(() => getDatabaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = dbUrl.trim().replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/test.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ping: 'ok', time: Date.now() }),
      });
      if (res.ok) {
        // delete test node
        await fetch(`${cleanUrl}/test.json`, { method: 'DELETE' });
        setTestResult('success');
      } else {
        setTestResult('error: ' + res.statusText);
      }
    } catch (e: unknown) {
      setTestResult('error: ' + ((e as Error)?.message || 'Connection failed'));
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUrl.trim()) {
      alert('Please enter your Firebase Database URL');
      return;
    }

    saveDatabaseUrl(dbUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Firebase Realtime Database</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Live cloud synchronization across customer store and admin hub
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-muted)', padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="form-group">
            <label className="form-label">Firebase Database URL *</label>
            <input
              type="url"
              required
              value={dbUrl}
              onChange={(e) => {
                setDbUrl(e.target.value);
                setTestResult(null);
              }}
              className="form-input"
              placeholder="https://your-project-default-rtdb.firebaseio.com"
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Current Connected Database: <code>https://the-full-cart-51c6c-default-rtdb.firebaseio.com</code>
            </span>
          </div>

          {/* Test connection result */}
          {testResult === 'success' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <CheckCircle2 size={16} />
              <span>Connection Successful! Database is live and writable.</span>
            </div>
          )}

          {testResult && testResult.startsWith('error') && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}>
              ⚠️ {testResult}
            </div>
          )}

          <div className="firebase-modal-actions" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-secondary"
              style={{ fontSize: '0.82rem' }}
            >
              {testing ? 'Testing...' : '⚡ Test Connection'}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button type="submit" className="btn-primary">
                {savedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save URL</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
