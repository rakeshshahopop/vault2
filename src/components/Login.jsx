import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError('Access denied — check the credentials and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ marginBottom: 28 }}>
          <div className="mono" style={{ color: 'var(--brass)', fontSize: 12, letterSpacing: '0.14em' }}>
            VAULT — RESTRICTED ACCESS
          </div>
          <div style={{ color: 'var(--paper-dim)', fontSize: 13, marginTop: 6 }}>
            No public entry. Credentials required.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={label}>Email</label>
          <input
            style={input}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={{ ...label, marginTop: 14 }}>Password</label>
          <input
            style={input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="mono" style={{ color: 'var(--danger)', fontSize: 12, marginTop: 14 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={busy} style={submitBtn}>
            {busy ? 'VERIFYING…' : 'ENTER'}
          </button>
        </form>
      </div>
    </div>
  );
}

const wrap = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--ink-950)',
};

const card = {
  width: 360,
  maxWidth: '88vw',
  background: 'var(--ink-900)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  padding: 32,
};

const label = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.08em',
  color: 'var(--paper-dim)',
  marginBottom: 6,
};

const input = {
  width: '100%',
  background: 'var(--ink-800)',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '10px 12px',
  color: 'var(--paper)',
  fontSize: 14,
};

const submitBtn = {
  marginTop: 22,
  width: '100%',
  padding: '11px 0',
  background: 'var(--brass)',
  color: 'var(--ink-950)',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.08em',
  fontSize: 13,
};
