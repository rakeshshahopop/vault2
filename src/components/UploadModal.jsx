import { useRef, useState } from 'react';
import { uploadFile, addVideoLink } from '../lib/data';

export default function UploadModal({ folderId, uid, onClose }) {
  const [tab, setTab] = useState('file'); // 'file' | 'link'
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState([]); // [{file, progress, done, error}]
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState('');
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList);
    const entries = files.map((file) => ({ file, progress: 0, done: false, error: null }));
    setQueue((q) => [...q, ...entries]);
    entries.forEach((entry) => runUpload(entry));
  }

  async function runUpload(entry) {
    try {
      await uploadFile(entry.file, folderId, uid, (pct) => {
        setQueue((q) =>
          q.map((e) => (e.file === entry.file ? { ...e, progress: pct } : e))
        );
      });
      setQueue((q) => q.map((e) => (e.file === entry.file ? { ...e, progress: 100, done: true } : e)));
    } catch (err) {
      setQueue((q) => q.map((e) => (e.file === entry.file ? { ...e, error: err.message || 'Upload failed' } : e)));
    }
  }

  async function submitLink(e) {
    e.preventDefault();
    setLinkError('');
    if (!/^https?:\/\/.+\.(mp4)([?#].*)?$/i.test(linkUrl.trim())) {
      setLinkError('Enter a direct .mp4 URL (link must end in .mp4).');
      return;
    }
    setLinkBusy(true);
    try {
      await addVideoLink(linkUrl, linkName, folderId, uid);
      setLinkUrl('');
      setLinkName('');
    } catch (err) {
      setLinkError('Could not save the link — try again.');
    } finally {
      setLinkBusy(false);
    }
  }

  const allDone = queue.length > 0 && queue.every((e) => e.done || e.error);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={tabs}>
          <button style={tabBtn(tab === 'file')} onClick={() => setTab('file')}>
            UPLOAD FILE
          </button>
          <button style={tabBtn(tab === 'link')} onClick={() => setTab('link')}>
            ADD .MP4 LINK
          </button>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>

        {tab === 'file' && (
          <div style={fileTabWrap}>
            <div style={scrollableContent}>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current.click()}
                style={dropzone(dragOver)}
              >
                <span className="mono" style={{ fontSize: 12, color: 'var(--paper-dim)', letterSpacing: '0.06em' }}>
                  DROP FILES HERE OR CLICK TO BROWSE
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files.length && handleFiles(e.target.files)}
                />
              </div>

              {queue.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {queue.map((entry, i) => (
                    <div key={i} style={progressRow}>
                      <span style={{ flex: 1, fontSize: 12, color: 'var(--paper)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.file.name}
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: entry.error ? 'var(--danger)' : 'var(--paper-dim)', width: 90, textAlign: 'right' }}>
                        {entry.error ? entry.error : entry.done ? 'DONE' : `${entry.progress.toFixed(0)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {queue.length > 0 && (
              <div style={pinnedFooter}>
                <button style={doneBtn} onClick={onClose} disabled={!allDone}>
                  {allDone ? 'DONE — CLOSE' : 'UPLOADING…'}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'link' && (
          <form onSubmit={submitLink} style={{ padding: 20 }}>
            <div style={{ color: 'var(--paper-dim)', fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
              This stores only the link. The video streams from its source instead of using
              storage space.
            </div>

            <label style={label}>Direct .mp4 URL</label>
            <input
              style={input}
              placeholder="https://example.com/video.mp4"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              required
            />

            <label style={{ ...label, marginTop: 12 }}>Display name (optional)</label>
            <input
              style={input}
              placeholder="What should this be called?"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
            />

            {linkError && (
              <div className="mono" style={{ color: 'var(--danger)', fontSize: 12, marginTop: 12 }}>
                {linkError}
              </div>
            )}

            <button type="submit" disabled={linkBusy} style={doneBtn}>
              {linkBusy ? 'SAVING…' : 'SAVE LINK'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

const modal = {
  width: 460,
  maxWidth: '92vw',
  maxHeight: '85vh',
  background: 'var(--ink-900)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const fileTabWrap = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
};

const scrollableContent = {
  padding: 20,
  overflowY: 'auto',
  maxHeight: '55vh',
};

const pinnedFooter = {
  padding: '14px 20px',
  borderTop: '1px solid var(--line)',
  flexShrink: 0,
};

const tabs = {
  display: 'flex',
  borderBottom: '1px solid var(--line)',
};

function tabBtn(active) {
  return {
    flex: 1,
    padding: '13px 0',
    background: active ? 'var(--ink-800)' : 'transparent',
    border: 'none',
    color: active ? 'var(--brass)' : 'var(--paper-dim)',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.08em',
    fontWeight: 600,
  };
}

const closeBtn = {
  width: 44,
  background: 'transparent',
  border: 'none',
  color: 'var(--paper-dim)',
};

function dropzone(active) {
  return {
    border: `1px dashed ${active ? 'var(--brass)' : 'var(--line)'}`,
    borderRadius: 8,
    padding: '36px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'rgba(201,138,62,0.06)' : 'transparent',
  };
}

const progressRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: 'var(--ink-800)',
  borderRadius: 6,
  padding: '8px 10px',
};

const doneBtn = {
  marginTop: 16,
  width: '100%',
  padding: '10px 0',
  background: 'var(--brass)',
  color: 'var(--ink-950)',
  border: 'none',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: '0.06em',
};

const label = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.06em',
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
  fontSize: 13,
};
