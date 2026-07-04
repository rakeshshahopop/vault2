// The HTML `download` attribute is ignored by browsers for cross-origin
// links (Cloudinary is always cross-origin from your app's domain), so it
// can't be relied on by itself. Instead, this fetches the file as binary
// data and saves it via a temporary same-origin blob URL, which forces a
// real save-to-disk regardless of origin or server headers.
export async function downloadFile(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch file (status ${response.status})`);
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
}

// Cloudinary can generate a still-frame thumbnail from a video by changing
// the delivery to an image request at a given timestamp. This works for
// any video already uploaded — no re-upload needed.
export function videoThumbnailUrl(url) {
  if (!url || !url.includes('/video/upload/')) return null;
  // Grab a frame at 1 second in, deliver as a jpg.
  const withFrame = url.replace('/video/upload/', '/video/upload/so_1.0/');
  return withFrame.replace(/\.[a-zA-Z0-9]+($|\?)/, '.jpg$1');
}
