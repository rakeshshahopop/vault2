import { useEffect, useState } from 'react';
import { watchFolders, createFolder, deleteFolder } from '../lib/data';

function FolderNode({ folder, depth, currentFolder, onNavigate, uid }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!expanded) return;
    const unsub = watchFolders(folder.id, setChildren);
    return unsub;
  }, [expanded, folder.id]);

  const isActive = currentFolder === folder.id;

  async function submitNew(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createFolder(newName, folder.id, uid);
    setNewName('');
    setAdding(false);
    if (!expanded) setExpanded(true);
  }

  return (
    <div>
      <div
        style={{ ...row(depth), background: isActive ? 'var(--ink-800)' : 'transparent' }}
        onClick={() => {
          setExpanded((e) => !e);
          onNavigate(folder);
        }}
      >
        <span className="mono" style={{ color: 'var(--paper-dim)', fontSize: 11, width: 12 }}>
          {expanded ? '▾' : '▸'}
        </span>
        <span style={{ color: isActive ? 'var(--paper)' : 'var(--paper-dim)', fontSize: 13, flex: 1 }}>
          {folder.name}
        </span>
        <button
          title="New subfolder"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
            setAdding((a) => !a);
          }}
          style={miniBtn}
        >
          +
        </button>
      </div>

      {expanded && (
        <div>
          {adding && (
            <form onSubmit={submitNew} style={{ ...row(depth + 1), paddingLeft: 12 + (depth + 1) * 16 }}>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => !newName && setAdding(false)}
                placeholder="Folder name…"
                style={inlineInput}
              />
            </form>
          )}
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              depth={depth + 1}
              currentFolder={currentFolder}
              onNavigate={onNavigate}
              uid={uid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ currentFolder, onNavigate, uid }) {
  const [rootFolders, setRootFolders] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const unsub = watchFolders(null, setRootFolders);
    return unsub;
  }, []);

  async function submitNew(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createFolder(newName, null, uid);
    setNewName('');
    setAdding(false);
  }

  return (
    <aside style={sidebar}>
      <div style={{ padding: '20px 16px 12px' }}>
        <div className="mono" style={{ color: 'var(--brass)', fontSize: 13, letterSpacing: '0.12em', fontWeight: 600 }}>
          VAULT
        </div>
        <div style={{ color: 'var(--paper-dim)', fontSize: 11, marginTop: 4 }}>Restricted archive</div>
      </div>

      <div style={{ padding: '4px 8px', flex: 1, overflowY: 'auto' }}>
        <div
          onClick={() => onNavigate(null)}
          style={{ ...row(0), background: currentFolder === null ? 'var(--ink-800)' : 'transparent' }}
        >
          <span className="mono" style={{ color: 'var(--paper-dim)', fontSize: 11, width: 12 }}>—</span>
          <span style={{ color: currentFolder === null ? 'var(--paper)' : 'var(--paper-dim)', fontSize: 13 }}>
            Root
          </span>
        </div>

        {rootFolders.map((folder) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            depth={0}
            currentFolder={currentFolder}
            onNavigate={onNavigate}
            uid={uid}
          />
        ))}

        {adding && (
          <form onSubmit={submitNew} style={{ ...row(0) }}>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => !newName && setAdding(false)}
              placeholder="Folder name…"
              style={inlineInput}
            />
          </form>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
        <button style={newFolderBtn} onClick={() => setAdding(true)}>
          + NEW FOLDER (ROOT)
        </button>
      </div>
    </aside>
  );
}

const sidebar = {
  width: 240,
  flexShrink: 0,
  background: 'var(--ink-900)',
  borderRight: '1px solid var(--line)',
  display: 'flex',
  flexDirection: 'column',
};

function row(depth) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px',
    paddingLeft: 8 + depth * 16,
    borderRadius: 6,
    cursor: 'pointer',
  };
}

const miniBtn = {
  background: 'none',
  border: 'none',
  color: 'var(--paper-dim)',
  fontSize: 13,
  padding: '0 4px',
};

const inlineInput = {
  background: 'var(--ink-800)',
  border: '1px solid var(--brass-dim)',
  borderRadius: 4,
  padding: '4px 8px',
  color: 'var(--paper)',
  fontSize: 12,
  width: '100%',
};

const newFolderBtn = {
  width: '100%',
  background: 'none',
  border: '1px dashed var(--line)',
  borderRadius: 6,
  padding: '9px 0',
  color: 'var(--paper-dim)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.06em',
};
