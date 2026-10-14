import React, { useState } from 'react';
import { X, Check, Database, HelpCircle, ExternalLink } from 'lucide-react';
import { getFirebaseConfig, saveCustomFirebaseConfig, type FirebaseConfigParams } from '../../services/firebase';

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
  const current = getFirebaseConfig();

  const [form, setForm] = useState<FirebaseConfigParams>({
    apiKey: current?.apiKey || '',
    authDomain: current?.authDomain || '',
    projectId: current?.projectId || '',
    storageBucket: current?.storageBucket || '',
    messagingSenderId: current?.messagingSenderId || '',
    appId: current?.appId || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apiKey || !form.projectId) {
      alert('Please fill in at least API Key and Project ID');
      return;
    }

    saveCustomFirebaseConfig(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved();
      onClose();
      // Reload page to re-initialize Firebase singleton with new credentials
      window.location.reload();
    }, 1200);
  };

  const handleClear = () => {
    if (confirm('Clear custom Firebase configuration and return to default/env?')) {
      saveCustomFirebaseConfig(null);
      window.location.reload();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Firebase Database Setup</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Connect your Google Firebase Cloud Firestore database
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

        {/* Instructions banner */}
        <div style={{
          margin: '20px 24px 0',
          padding: '14px 16px',
          borderRadius: '12px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.8rem',
          lineHeight: '1.6',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#a5b4fc', marginBottom: '4px' }}>
            <HelpCircle size={15} />
            <span>How to get your free Firebase keys:</span>
          </div>
          <ol style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>
            <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>console.firebase.google.com <ExternalLink size={12} style={{ display: 'inline' }} /></a> and create a free project.</li>
            <li>In the Project Overview, click the <strong>Web (&lt;/&gt;)</strong> icon to register an app.</li>
            <li>Copy the <code>firebaseConfig</code> values and paste them below.</li>
            <li>In Firebase Console, click <strong>Build &gt; Firestore Database &gt; Create Database</strong> (Start in test mode).</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">API Key (apiKey) *</label>
              <input
                type="text"
                required
                placeholder="AIzaSy..."
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project ID (projectId) *</label>
              <input
                type="text"
                required
                placeholder="the-full-cart-12345"
                value={form.projectId}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    projectId: val,
                    authDomain: form.authDomain || (val ? `${val}.firebaseapp.com` : ''),
                    storageBucket: form.storageBucket || (val ? `${val}.appspot.com` : ''),
                  });
                }}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Auth Domain (authDomain)</label>
              <input
                type="text"
                placeholder="your-app.firebaseapp.com"
                value={form.authDomain}
                onChange={(e) => setForm({ ...form, authDomain: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Storage Bucket (storageBucket)</label>
              <input
                type="text"
                placeholder="your-app.appspot.com"
                value={form.storageBucket}
                onChange={(e) => setForm({ ...form, storageBucket: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Messaging Sender ID</label>
              <input
                type="text"
                placeholder="1029384756"
                value={form.messagingSenderId}
                onChange={(e) => setForm({ ...form, messagingSenderId: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">App ID (appId)</label>
              <input
                type="text"
                placeholder="1:1029384756:web:abcd1234efgh"
                value={form.appId}
                onChange={(e) => setForm({ ...form, appId: e.target.value })}
                className="form-input"
              />
            </div>

          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '8px',
          }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', color: '#f87171' }}
            >
              Reset to Defaults
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {savedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>Connected! Reloading...</span>
                  </>
                ) : (
                  <span>Save & Connect Firebase</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
