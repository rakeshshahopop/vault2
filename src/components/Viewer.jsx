import { useEffect, useState } from 'react';
import { getFileById } from '../lib/data';
import { downloadFile } from '../lib/download';

function DownloadButton({ file, big }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setBusy(true);
    setError('');
    try {
      await downloadFile(file.url, file.name);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: big ? 'center' : 'flex-end', gap: 6 }}>
      <button onClick={handleClick} disabled={busy} style={big ? dlBtnBig : dlBtn}>
        {busy ? 'DOWNLOADING…' : big ? `DOWNLOAD ${file.name}` : 'DOWNLOAD'}
      </button>
      {error && (
        <span className="mono" style={{ fontSize: 11, color: 'var(--danger)', maxWidth: 280, textAlign: big ? 'center' : 'right' }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default function Viewer({ fileId }) {
  const [file, setFile] = useState(undefined); // undefined = loading, null = not found
  const [error, setError] = useState('');
  const [pdfFailed, setPdfFailed] = useState(false);

  useEffect(() => {
    getFileById(fileId)
      .then(setFile)
      .catch(() => setError('Could not load this item.'));
  }, [fileId]);

  if (error) {
    return <Center><span className="mono" style={{ color: 'var(--danger)' }}>{error}</span></Center>;
  }

  if (file === undefined) {
    return <Center><span className="mono" style={{ color: 'var(--paper-dim)' }}>LOADING…</span></Center>;
  }

  if (file === null) {
    return <Center><span className="mono" style={{ color: 'var(--paper-dim)' }}>ITEM NOT FOUND</span></Center>;
  }

  document.title = file.name;

  return (
    <div style={page}>
      <div style={bar}>
        <span style={{ fontSize: 13, color: 'var(--paper)' }}>{file.name}</span>
        {file.type === 'file' && file.url && <DownloadButton file={file} />}
      </div>

      <div style={stage}>
        {file.kind === 'video' && (
          <video src={file.url} controls autoPlay style={mediaStyle} />
        )}

        {file.kind === 'image' && (
          <img src={file.url} alt={file.name} style={mediaStyle} />
        )}

        {file.kind === 'pdf' && !pdfFailed && (
          <iframe
            src={file.url}
            title={file.name}
            style={{ ...mediaStyle, background: 'white', width: '90vw', height: '90vh' }}
            onError={() => setPdfFailed(true)}
          />
        )}

        {file.kind === 'pdf' && pdfFailed && (
          <PdfFallback file={file} />
        )}

        {file.kind === 'other' && (
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{ color: 'var(--paper-dim)', fontSize: 13, marginBottom: 16 }}>
              This file type can't be previewed in-browser.
            </div>
            {file.url && <DownloadButton file={file} big />}
          </div>
        )}
      </div>
    </div>
  );
}

function PdfFallback({ file }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 420 }}>
      <div className="mono" style={{ color: 'var(--paper-dim)', fontSize: 13, marginBottom: 8 }}>
        This PDF can't be previewed in-browser.
      </div>
      <div className="mono" style={{ color: 'var(--paper-dim)', fontSize: 11, marginBottom: 16, lineHeight: 1.6 }}>
        If this keeps happening for every PDF, check Cloudinary → Settings →
        Security → "Allow delivery of PDF and ZIP files" is turned ON.
        Cloudinary blocks these by default on new accounts.
      </div>
      {file.url && <DownloadButton file={file} big />}
    </div>
  );
}

function Center({ children }) {
  return <div style={{ ...page, alignItems: 'center', justifyContent: 'center' }}>{children}</div>;
}

const page = {
  height: '100vh',
  background: '#000',
  display: 'flex',
  flexDirection: 'column',
};

const bar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  borderBottom: '1px solid #1f242c',
  background: 'var(--ink-950)',
};

const stage = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  padding: 20,
};

const mediaStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  borderRadius: 4,
};

const dlBtn = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.06em',
  color: 'var(--brass)',
  background: 'none',
  border: '1px solid var(--brass-dim)',
  borderRadius: 4,
  padding: '6px 10px',
};

const dlBtnBig = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  letterSpacing: '0.06em',
  color: 'var(--ink-950)',
  background: 'var(--brass)',
  border: 'none',
  borderRadius: 6,
  padding: '10px 18px',
};
