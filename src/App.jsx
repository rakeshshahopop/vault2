import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login.jsx';
import Vault from './components/Vault.jsx';
import Viewer from './components/Viewer.jsx';

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const hash = useHashRoute();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const viewMatch = hash.match(/^#\/view\/(.+)$/);

  if (user === undefined) {
    return (
      <div style={screenCenter}>
        <span className="mono" style={{ color: 'var(--paper-dim)', letterSpacing: '0.08em' }}>
          CHECKING CREDENTIALS…
        </span>
      </div>
    );
  }

  if (!user) {
    // The viewer route also requires auth - if not signed in, force login first.
    return <Login />;
  }

  if (viewMatch) {
    return <Viewer fileId={decodeURIComponent(viewMatch[1])} />;
  }

  return <Vault user={user} onSignOut={() => signOut(auth)} />;
}

const screenCenter = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--ink-950)',
};
