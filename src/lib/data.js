import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../cloudinary';

// NOTE: these queries intentionally use ONLY a `where` filter, with no
// `orderBy`. Combining an equality filter on one field with orderBy on a
// different field requires a composite index in Firestore — without it,
// the listener fails silently (no error in the UI, nothing ever loads).
// Sorting is done client-side instead, which needs no index at all.

export function watchFolders(parentId, cb, onError) {
  const q = query(collection(db, 'folders'), where('parentId', '==', parentId));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      cb(items);
    },
    (err) => {
      console.error('watchFolders error:', err);
      onError && onError(err);
    }
  );
}

export function watchFiles(folderId, cb, onError) {
  const q = query(collection(db, 'files'), where('folderId', '==', folderId));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      items.sort((a, b) => {
        const at = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bt = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bt - at; // newest first
      });
      cb(items);
    },
    (err) => {
      console.error('watchFiles error:', err);
      onError && onError(err);
    }
  );
}

export async function createFolder(name, parentId, uid) {
  await addDoc(collection(db, 'folders'), {
    name: name.trim(),
    parentId,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
}

export async function deleteFolder(folderId) {
  await deleteDoc(doc(db, 'folders', folderId));
}

export function guessKind(mimeType, name) {
  const lower = (name || '').toLowerCase();
  if ((mimeType && mimeType.startsWith('video/')) || lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.webm')) {
    return 'video';
  }
  if ((mimeType && mimeType.startsWith('image/')) || /\.(png|jpe?g|gif|webp|svg)$/.test(lower)) {
    return 'image';
  }
  if (lower.endsWith('.pdf')) return 'pdf';
  return 'other';
}

// Uploads directly from the browser to Cloudinary using an UNSIGNED upload
// preset (no server, no secret key exposed). Progress is tracked via XHR
// since fetch() doesn't expose upload progress.
function cloudinaryUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      reject(new Error('Cloudinary is not configured yet — see src/cloudinary.js'));
      return;
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress && onProgress((e.loaded / e.total) * 100);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        let message = `Upload failed (status ${xhr.status})`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed.error && parsed.error.message) message = parsed.error.message;
        } catch (e) {
          // ignore parse failure, use default message
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export async function uploadFile(file, folderId, uid, onProgress) {
  const result = await cloudinaryUpload(file, onProgress);

  await addDoc(collection(db, 'files'), {
    folderId,
    name: file.name,
    type: 'file',
    mimeType: file.type,
    kind: guessKind(file.type, file.name),
    size: file.size,
    cloudinaryPublicId: result.public_id,
    cloudinaryResourceType: result.resource_type,
    url: result.secure_url,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
}

export async function addVideoLink(url, name, folderId, uid) {
  await addDoc(collection(db, 'files'), {
    folderId,
    name: name.trim() || url,
    type: 'link',
    mimeType: 'video/mp4',
    kind: 'video',
    size: null,
    cloudinaryPublicId: null,
    cloudinaryResourceType: null,
    url: url.trim(),
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
}

export async function getFileById(fileId) {
  const snap = await getDoc(doc(db, 'files', fileId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// NOTE: with unsigned uploads, deleting the actual file from Cloudinary
// requires your API secret, which must never live in browser code. This
// removes the record from your vault (it disappears from the app), but the
// underlying file stays in your Cloudinary account until you delete it
// there directly, or wire up a small signed-delete endpoint later.
export async function deleteFile(fileEntry) {
  await deleteDoc(doc(db, 'files', fileEntry.id));
}
