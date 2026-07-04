import { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';
import FileGrid from './FileGrid.jsx';
import UploadModal from './UploadModal.jsx';

export default function Vault({ user, onSignOut }) {
  const [currentFolder, setCurrentFolder] = useState(null); // null = root
  const [trail, setTrail] = useState([{ id: null, name: 'Root' }]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Sidebar is an off-canvas drawer on narrow screens, closed by default.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navigateTo(folder) {
    if (folder === null) {
      setCurrentFolder(null);
      setTrail([{ id: null, name: 'Root' }]);
    } else {
      setCurrentFolder(folder.id);
      setTrail((prev) => {
        const idx = prev.findIndex((f) => f.id === folder.id);
        if (idx !== -1) return prev.slice(0, idx + 1);
        return [...prev, folder];
      });
    }
    // On mobile, picking a folder should close the drawer so the file list
    // is immediately visible instead of staying hidden behind it.
    setSidebarOpen(false);
  }

  return (
    <div style={shell}>
      <Sidebar
        currentFolder={currentFolder}
        onNavigate={navigateTo}
        uid={user.uid}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={main}>
        <header style={topbar}>
          <div style={topbarLeft}>
            <button
              className="hamburger-btn"
              style={hamburgerBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open folders"
            >
              ☰
            </button>
            <div style={crumbRow}>
              {trail.map((f, i) => (
                <span key={f.id ?? 'root'} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <button
                    onClick={() => navigateTo(f.id === null ? null : f)}
                    style={crumbBtn(i === trail.length - 1)}
                  >
                    {f.name}
                  </button>
                  {i < trail.length - 1 && <span style={{ color: 'var(--paper-dim)' }}>/</span>}
                </span>
              ))}
            </div>
          </div>

          <div style={topbarRight}>
            <input
              placeholder="Filter this folder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInput}
            />
            <button style={primaryBtn} onClick={() => setUploadOpen(true)}>
              + ADD
            </button>
            <button style={ghostBtn} onClick={onSignOut}>
              SIGN OUT
            </button>
          </div>
        </header>

        <FileGrid folderId={currentFolder} search={search} onOpenFolder={navigateTo} />
      </div>

      {uploadOpen && (
        <UploadModal
          folderId={currentFolder}
          uid={user.uid}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
}

const shell = {
  display: 'flex',
  height: '100vh',
  background: 'var(--ink-950)',
  position: 'relative',
  overflow: 'hidden',
};

const main = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  width: '100%',
};

const topbar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: '1px solid var(--line)',
  gap: 12,
  flexWrap: 'wrap',
};

const topbarLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
};

const crumbRow = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  flexWrap: 'wrap',
  minWidth: 0,
};

// Only shown on narrow screens (see index.css / .hamburger-btn media query).
const hamburgerBtn = {
  display: 'none',
  background: 'var(--ink-800)',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '8px 10px',
  color: 'var(--paper)',
  fontSize: 14,
  flexShrink: 0,
};

const topbarRight = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap',
};

function crumbBtn(active) {
  return {
    background: 'none',
    border: 'none',
    padding: 0,
    color: active ? 'var(--paper)' : 'var(--paper-dim)',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    letterSpacing: '0.03em',
    fontWeight: active ? 600 : 400,
  };
}

const searchInput = {
  background: 'var(--ink-800)',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '8px 12px',
  color: 'var(--paper)',
  fontSize: 13,
  width: 200,
  maxWidth: '40vw',
};

const primaryBtn = {
  background: 'var(--brass)',
  color: 'var(--ink-950)',
  border: 'none',
  borderRadius: 6,
  padding: '9px 14px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.06em',
};

const ghostBtn = {
  background: 'none',
  border: '1px solid var(--line)',
  borderRadius: 6,
  padding: '9px 14px',
  color: 'var(--paper-dim)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.06em',
};
