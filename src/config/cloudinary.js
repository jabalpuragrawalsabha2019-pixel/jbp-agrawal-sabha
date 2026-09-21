/**
 * Cloudinary image upload/delete via signed Vercel API (no API secret on device).
 * Uploads are scoped under jbp-agrawal/{folder}/{userId}/ so deletes stay ownership-safe.
 */
import { apiRequest } from '../api/client';

/**
 * Extracts Cloudinary public_id from a delivery URL.
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('cloudinary.com')) return null;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  let path = url.slice(idx + marker.length).split('?')[0];
  const parts = path.split('/').filter(Boolean);

  while (parts.length) {
    const part = parts[0];
    if (part.startsWith('v') && /^v\d+$/.test(part)) {
      parts.shift();
      continue;
    }
    if (part.includes(',') || /^[a-z]+_/.test(part)) {
      parts.shift();
      continue;
    }
    break;
  }

  if (!parts.length) return null;
  const last = parts[parts.length - 1];
  parts[parts.length - 1] = last.replace(/\.[a-zA-Z0-9]+$/, '');
  return decodeURIComponent(parts.join('/'));
}

/**
 * Uploads an image using a server-signed Cloudinary request.
 * @param {string} imageUri - Local file URI
 * @param {string} folder - Folder under jbp-agrawal/
 * @returns {Promise<{success: boolean, url?: string, publicId?: string, error?: string}>}
 */
export const uploadImageToCloudinary = async (imageUri, folder = 'general') => {
  try {
    const signed = await apiRequest('/api/cloudinary?action=sign', {
      method: 'POST',
      body: JSON.stringify({ folder }),
    });

    const fileExtension = imageUri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}.${fileExtension}`;

    const form = new FormData();
    form.append('file', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: fileName,
    });
    form.append('api_key', signed.apiKey);
    form.append('timestamp', String(signed.timestamp));
    form.append('signature', signed.signature);
    form.append('folder', signed.folder);

    const response = await fetch(signed.uploadUrl, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Deletes a Cloudinary asset by public_id through the secured API.
 * @param {string} publicId
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return { success: true, skipped: true };
    await apiRequest('/api/cloudinary?action=delete', {
      method: 'POST',
      body: JSON.stringify({ publicId }),
    });
    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes a Cloudinary asset by delivery URL (no-op for local/non-Cloudinary URLs).
 * @param {string|null|undefined} url
 */
export const deleteCloudinaryUrl = async (url) => {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return { success: true, skipped: true };
  return deleteImageFromCloudinary(publicId);
};

/**
 * Deletes many Cloudinary delivery URLs (best-effort).
 * @param {Array<string|null|undefined>} urls
 */
export const deleteCloudinaryUrls = async (urls = []) => {
  const cleaned = urls.filter((u) => extractPublicIdFromUrl(u));
  if (!cleaned.length) return { success: true, deleted: [], failed: [] };

  try {
    return await apiRequest('/api/cloudinary?action=delete-many', {
      method: 'POST',
      body: JSON.stringify({ urls: cleaned }),
    });
  } catch (error) {
    console.error('Cloudinary delete-many error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Uploads a new image, then deletes the previous Cloudinary asset (if any).
 * Delete happens AFTER successful upload so a failed upload keeps the old image.
 * @param {string} imageUri - Local URI
 * @param {string} folder
 * @param {string|null|undefined} previousUrl
 */
export const replaceCloudinaryImage = async (
  imageUri,
  folder,
  previousUrl,
) => {
  const uploaded = await uploadImageToCloudinary(imageUri, folder);
  if (!uploaded.success) return uploaded;

  if (previousUrl && previousUrl !== uploaded.url) {
    const del = await deleteCloudinaryUrl(previousUrl);
    if (!del.success) {
      console.warn('Uploaded new image but failed to delete old asset:', del.error);
    }
  }

  return uploaded;
};

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  deleteCloudinaryUrl,
  deleteCloudinaryUrls,
  replaceCloudinaryImage,
  extractPublicIdFromUrl,
};
