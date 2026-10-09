/* ============================================================
   DESKLY · PHOTOS
   Upload, reorder, remove. Shared between dashboard and desk.
   ============================================================ */

window.PHOTOS = (function(){

  const BUCKET = 'desk-photos';
  const MAX_PHOTOS = 10;
  const MAX_DIM = 1600;
  const JPEG_QUALITY = 0.82;

  /* Compress an image file. Returns a Blob (JPEG). */
  function compress(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read the file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not open the image.'));
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          const long = Math.max(w, h);
          if (long > MAX_DIM) {
            const scale = MAX_DIM / long;
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          canvas.toBlob(blob => {
            if (!blob) return reject(new Error('Could not process the image.'));
            resolve(blob);
          }, 'image/jpeg', JPEG_QUALITY);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* Upload a compressed blob to Supabase Storage.
     Uses the user's session token so the request is authenticated. */
  async function upload(blob, deskId){
    const cfg = window.SUPABASE_CONFIG || {};
    if (!cfg.url || !cfg.anonKey) throw new Error('Storage is not connected.');

    /* Prefer the user's session token. Fall back to the anon key. */
    const session = (window.DB && DB.getSession) ? DB.getSession() : null;
    const token = session?.access_token || cfg.anonKey;

    const ext = 'jpg';
    const filename = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    const path = deskId + '/' + filename;

    const url = cfg.url + '/storage/v1/object/' + BUCKET + '/' + path;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey':        cfg.anonKey,
        'Authorization': 'Bearer ' + token,
        'Content-Type':  'image/jpeg',
        'x-upsert':      'false'
      },
      body: blob
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Upload failed:', err);
      throw new Error('Upload failed. Try again.');
    }

    return cfg.url + '/storage/v1/object/public/' + BUCKET + '/' + path;
  }

  /* Delete one file from storage by public URL. */
  async function remove(url){
    const cfg = window.SUPABASE_CONFIG || {};
    if (!cfg.url || !cfg.anonKey) return;

    const marker = '/storage/v1/object/public/' + BUCKET + '/';
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);

    const session = (window.DB && DB.getSession) ? DB.getSession() : null;
    const token = session?.access_token || cfg.anonKey;

    const endpoint = cfg.url + '/storage/v1/object/' + BUCKET + '/' + path;

    try {
      await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'apikey':        cfg.anonKey,
          'Authorization': 'Bearer ' + token
        }
      });
    } catch(e) { /* silent */ }
  }

  return { compress, upload, remove, MAX_PHOTOS };

})();