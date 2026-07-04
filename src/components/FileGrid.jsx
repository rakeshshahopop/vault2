import { useEffect, useState } from 'react';
import { watchFolders, watchFiles, deleteFile, deleteFolder } from '../lib/data';
import { downloadFile, videoThumbnailUrl } from '../lib/download';

const KIND_STYLE = {
  video: { color: 'var(--status-blue)', label: 'VID' },
  image: { color: 'var(--brass)', label: 'IMG' },
  pdf: { color: '#9b7ad1', label: 'PDF' },
  other: { color: 'var(--paper-dim)', label: 'DOC' },
};

function formatSize(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function openViewer(fileId) {
  const url = `${window.location.origin}${window.location.pathname}#/view/${encodeURIComponent(fileId)}`;
  window.open(url, '_blank', 'noopener');
}

function DownloadButton({ file, compact }) {
  const [busy, setBusy] = useState(false);
  if (file.type !== 'file' || !file.url) return null;

  async function handleClick(e) {
    e.stopPropagation();
    setBusy(true);
    try {
      await downloadFile(file.url, file.name);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={busy} style={compact ? tileLinkBtn : linkBtn}>
      {busy ? '…' : 'GET'}
    </button>
  );
}

export default function FileGrid({ folderId, search, onOpenFolder }) {
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'grid'

  useEffect(() => {
    const unsub = watchFolders(folderId, setFolders, (err) =>
      setLoadError(`Couldn't load folders: ${err.message}`)
    );
    return unsub;
  }, [folderId]);

  useEffect(() => {
    const unsub = watchFiles(folderId, setFiles, (err) =>
      setLoadError(`Couldn't load files: ${err.message}`)
    );
    return unsub;
  }, [folderId]);

  const term = search.trim().toLowerCase();
  const visibleFolders = term ? folders.filter((f) => f.name.toLowerCase().includes(term)) : folders;
  const visibleFiles = term ? files.filter((f) => f.name.toLowerCase().includes(term)) : files;

  const isEmpty = visibleFolders.length === 0 && visibleFiles.length === 0;

  return (
    <div style={wrap}>
      <div style={viewToggleRow}>
        <button onClick={() => setView('list')} style={toggleBtn(view === 'list')}>≡ LIST</button>
        <button onClick={() => setView('grid')} style={toggleBtn(view === 'grid')}>⊞ GRID</button>
      </div>

      {loadError && (
        <div style={errorBanner}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--danger)' }}>{loadError}</span>
        </div>
      )}

      {isEmpty && (
        <div style={emptyState}>
          <div className="mono" style={{ color: 'var(--paper-dim)', fontSize: 12, letterSpacing: '0.06em' }}>
            {term ? 'NO MATCHES IN THIS FOLDER' : 'THIS FOLDER IS EMPTY — ADD A FILE OR LINK'}
          </div>
        </div>
      )}

      {view === 'list' ? (
        <div>
          {visibleFolders.map((folder) => (
            <div key={folder.id} style={rowStyle} onClick={() => onOpenFolder(folder)}>
              <span className="stamp" style={{ color: 'var(--paper-dim)' }}>DIR</span>
              <span style={nameStyle}>{folder.name}</span>
              <span style={metaStyle}>folder</span>
              <button
                style={dangerBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete folder "${folder.name}"? Files inside will remain orphaned.`)) {
                    deleteFolder(folder.id);
                  }
                }}
              >
                DEL
              </button>
            </div>
          ))}

          {visibleFiles.map((file) => {
            const kind = KIND_STYLE[file.kind] || KIND_STYLE.other;
            return (
              <div key={file.id} style={rowStyle} onClick={() => openViewer(file.id)}>
                <span className="stamp" style={{ color: kind.color }}>{kind.label}</span>
                <span style={nameStyle}>{file.name}</span>
                <span style={metaStyle}>
                  {file.type === 'link' ? 'external link' : formatSize(file.size)}
                </span>
                <DownloadButton file={file} />
                <button
                  style={dangerBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${file.name}"?`)) deleteFile(file);
                  }}
                >
                  DEL
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tile-grid" style={gridWrap}>
          {visibleFolders.map((folder) => (
            <div key={folder.id} style={tileStyle} onClick={() => onOpenFolder(folder)}>
              <div style={tileThumb}>
                <span className="stamp" style={{ color: 'var(--paper-dim)', fontSize: 13 }}>DIR</span>
              </div>
              <div style={tileFooter}>
                <div style={tileName} title={folder.name}>{folder.name}</div>
                <div style={tileActions}>
                  <span style={tileSpacer} />
                  <button
                    style={tileDangerBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete folder "${folder.name}"? Files inside will remain orphaned.`)) {
                        deleteFolder(folder.id);
                      }
                    }}
                  >
                    DEL
                  </button>
                </div>
              </div>
            </div>
          ))}

          {visibleFiles.map((file) => {
            const kind = KIND_STYLE[file.kind] || KIND_STYLE.other;
            const thumb =
              file.kind === 'image'
                ? file.url
                : file.kind === 'video'
                ? videoThumbnailUrl(file.url)
                : null;

            return (
              <div key={file.id} style={tileStyle} onClick={() => openViewer(file.id)}>
                <div style={tileThumb}>
                  {thumb ? (
                    <img src={thumb} alt={file.name} style={tileImg} loading="lazy" />
                  ) : (
                    <span className="stamp" style={{ color: kind.color, fontSize: 13 }}>{kind.label}</span>
                  )}
                  {file.kind === 'video' && (
                    <span style={playBadge}>▶</span>
                  )}
                </div>
                <div style={tileFooter}>
                  <div style={tileName} title={file.name}>{file.name}</div>
                  <div style={tileActions}>
                    <DownloadButton file={file} compact />
                    <button
                      style={tileDangerBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${file.name}"?`)) deleteFile(file);
                      }}
                    >
                      DEL
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const wrap = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 24px 24px',
};

const viewToggleRow = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '6px 0 10px',
};

function toggleBtn(active) {
  return {
    background: active ? 'var(--ink-800)' : 'transparent',
    border: '1px solid var(--line)',
    borderRadius: 6,
    padding: '6px 10px',
    color: active ? 'var(--brass)' : 'var(--paper-dim)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.06em',
  };
}

const errorBanner = {
  padding: '10px 14px',
  marginBottom: 8,
  background: 'rgba(209, 91, 91, 0.08)',
  border: '1px solid var(--danger)',
  borderRadius: 6,
};

const emptyState = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 240,
};

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  borderBottom: '1px solid var(--line)',
  cursor: 'pointer',
  flexWrap: 'wrap',
};

const nameStyle = {
  flex: '1 1 140px',
  minWidth: 0,
  fontSize: 14,
  color: 'var(--paper)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--paper-dim)',
  minWidth: 70,
  textAlign: 'right',
};

const linkBtn = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--status-blue)',
  background: 'none',
  border: '1px solid var(--status-blue-dim)',
  borderRadius: 4,
  padding: '3px 8px',
  whiteSpace: 'nowrap',
};

const dangerBtn = {
  background: 'none',
  border: '1px solid var(--line)',
  borderRadius: 4,
  padding: '3px 8px',
  color: 'var(--paper-dim)',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
};

// --- Grid view ---
// Every tile has the EXACT same structure (thumbnail box + footer with name
// + action row) regardless of whether it's a folder or a file, and regardless
// of whether a download button is present — a fixed-width spacer takes the
// download button's place when there isn't one, so heights never shift.

const gridWrap = {
  gap: 14,
};

const tileStyle = {
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid var(--line)',
  borderRadius: 8,
  cursor: 'pointer',
  background: 'var(--ink-900)',
  overflow: 'hidden',
};

const tileThumb = {
  position: 'relative',
  width: '100%',
  aspectRatio: '1 / 1',
  background: 'var(--ink-800)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0,
};

const tileImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const playBadge = {
  position: 'absolute',
  bottom: 6,
  right: 6,
  background: 'rgba(0,0,0,0.6)',
  color: '#fff',
  borderRadius: '50%',
  width: 22,
  height: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
};

const tileFooter = {
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  height: 56,
  flexShrink: 0,
};

const tileName = {
  fontSize: 12,
  color: 'var(--paper)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: '16px',
};

const tileActions = {
  display: 'flex',
  gap: 6,
  height: 22,
};

const tileSpacer = {
  flex: 1,
};

const tileLinkBtn = {
  ...linkBtn,
  flex: 1,
  textAlign: 'center',
  padding: '3px 4px',
};

const tileDangerBtn = {
  ...dangerBtn,
  flex: 1,
  textAlign: 'center',
};
