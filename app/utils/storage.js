import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PHOTO_URI: 'artistic_photo_uri',
  SELECTED_STYLE: 'artistic_selected_style',
  STYLE_IMAGE: 'artistic_style_image',
};

/**
 * Save the current photo and style information
 * @param {string} photoUri - The URI of the uploaded photo
 * @param {string} selectedStyle - The name of the selected style
 * @param {string} styleImage - The image of the selected style
 */
export const savePhotoAndStyle = async (photoUri, selectedStyle, styleImage) => {
  try {
    if (photoUri) {
      await AsyncStorage.setItem(STORAGE_KEYS.PHOTO_URI, photoUri);
    }
    
    if (selectedStyle) {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_STYLE, selectedStyle);
    }
    
    if (styleImage) {
      await AsyncStorage.setItem(STORAGE_KEYS.STYLE_IMAGE, styleImage);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving photo and style:', error);
    return false;
  }
};

/**
 * Get the saved photo and style information
 * @returns {Promise<{photoUri: string|null, selectedStyle: string|null, styleImage: string|null}>}
 */
export const getPhotoAndStyle = async () => {
  try {
    const photoUri = await AsyncStorage.getItem(STORAGE_KEYS.PHOTO_URI);
    const selectedStyle = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_STYLE);
    const styleImage = await AsyncStorage.getItem(STORAGE_KEYS.STYLE_IMAGE);
    
    return {
      photoUri,
      selectedStyle,
      styleImage,
    };
  } catch (error) {
    console.error('Error getting photo and style:', error);
    return {
      photoUri: null,
      selectedStyle: null,
      styleImage: null,
    };
  }
};

/**
 * Clear the saved photo and style information
 */
export const clearPhotoAndStyle = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PHOTO_URI);
    await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_STYLE);
    await AsyncStorage.removeItem(STORAGE_KEYS.STYLE_IMAGE);
    return true;
  } catch (error) {
    console.error('Error clearing photo and style:', error);
    return false;
  }
}; 