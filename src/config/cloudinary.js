// src/config/cloudinary.js
import Constants from 'expo-constants';

const CLOUDINARY_CLOUD_NAME = Constants.expoConfig.extra.cloudinaryCloudName;
const CLOUDINARY_UPLOAD_PRESET = Constants.expoConfig.extra.cloudinaryUploadPreset;

export const uploadImageToCloudinary = async (imageUri, folder = 'general') => {
  try {
    const data = new FormData();
    
    // Get file extension
    const fileExtension = imageUri.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    
    data.append('file', {
      uri: imageUri,
      type: `image/${fileExtension}`,
      name: fileName,
    });
    
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    data.append('folder', `jbp-agrawal/${folder}`);
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

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

export const deleteImageFromCloudinary = async (publicId) => {
  try {
    // This would require server-side implementation with Cloudinary admin API
    // For now, images will remain on Cloudinary (within free tier limits)
    console.log('Delete not implemented - image retained:', publicId);
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