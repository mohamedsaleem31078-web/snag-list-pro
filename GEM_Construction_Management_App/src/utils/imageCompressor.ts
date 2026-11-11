/**
 * Heavy-duty Client-Side Image Optimizer & Compressor
 * Guarantees smooth performance and prevents memory/storage quotas
 * from overflowing when hundreds of high-res photos are uploaded.
 */

export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    let src = '';
    let isObjectUrl = false;

    if (typeof fileOrDataUrl === 'string') {
      src = fileOrDataUrl;
    } else {
      src = URL.createObjectURL(fileOrDataUrl);
      isObjectUrl = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (isObjectUrl) {
        URL.revokeObjectURL(src);
      }

      let { width, height } = img;

      // Calculate aspect ratio constraint
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
        return;
      }

      // Draw with smooth bi-cubic interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export compressed data URL (jpeg is widely supported and lightweight)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      if (isObjectUrl) {
        URL.revokeObjectURL(src);
      }
      reject(err);
    };

    img.src = src;
  });
}

/**
 * Calculates estimated base64 storage size in KB
 */
export function estimateDataSizeKB(data: any): number {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return Math.round((str.length * 2) / 1024);
  } catch {
    return 0;
  }
}
