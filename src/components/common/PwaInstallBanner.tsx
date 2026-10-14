import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('the_full_cart_pwa_dismissed') === 'true') {
      setDismissed(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!installPrompt || dismissed) return null;

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('the_full_cart_pwa_dismissed', 'true');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '76px', // above mobile bottom nav
      left: '16px',
      right: '16px',
      maxWidth: '460px',
      margin: '0 auto',
      zIndex: 900,
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(245, 158, 11, 0.35)',
      borderRadius: 'var(--radius-lg)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.5), 0 0 20px rgba(245, 158, 11, 0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo.png"
          alt="The Full Cart"
          style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #f59e0b' }}
        />
        <div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
            Install The Full Cart App
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Fast 1-tap shopping right from your home screen
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleInstall}
          className="btn-primary"
          style={{
            padding: '7px 14px',
            fontSize: '0.8rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Download size={14} />
          <span>Install</span>
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            color: 'var(--text-dim)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
