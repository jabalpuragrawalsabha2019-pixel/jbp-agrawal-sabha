/**
 * Cloudinary image upload/delete via signed Vercel API (no API secret on device).
 */
import { apiRequest } from '../api/client';

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
 * Deletes a Cloudinary asset through the secured API.
 * @param {string} publicId
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
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

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
};
