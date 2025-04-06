// Custom error classes for different types of errors
export class ImageProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

export class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
}

export class StyleSelectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StyleSelectionError';
  }
}

// Error messages for different scenarios
export const ERROR_MESSAGES = {
  IMAGE: {
    UPLOAD_FAILED: 'Failed to upload image. Please try again.',
    INVALID_FORMAT: 'Invalid image format. Please use JPG or PNG.',
    SIZE_TOO_LARGE: 'Image size too large. Please use an image under 10MB.',
    PROCESSING_FAILED: 'Failed to process image. Please try again.',
  },
  API: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    TIMEOUT: 'Request timed out. Please try again.',
    INVALID_RESPONSE: 'Invalid response from server.',
  },
  STYLE: {
    SELECTION_REQUIRED: 'Please select a style before generating.',
    INVALID_STYLE: 'Invalid style selected.',
    GENERATION_FAILED: 'Failed to generate image with selected style.',
  },
};

// Helper function to handle image-related errors
export const handleImageError = (error) => {
  if (error instanceof ImageProcessingError) {
    return {
      title: 'Image Error',
      message: error.message,
      action: 'Try Again',
    };
  }
  return {
    title: 'Image Error',
    message: ERROR_MESSAGES.IMAGE.PROCESSING_FAILED,
    action: 'Try Again',
  };
};

// Helper function to handle API-related errors
export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    return {
      title: 'API Error',
      message: error.message,
      action: 'Retry',
    };
  }
  return {
    title: 'Connection Error',
    message: ERROR_MESSAGES.API.NETWORK_ERROR,
    action: 'Retry',
  };
};

// Helper function to handle style-related errors
export const handleStyleError = (error) => {
  if (error instanceof StyleSelectionError) {
    return {
      title: 'Style Error',
      message: error.message,
      action: 'Select Again',
    };
  }
  return {
    title: 'Style Error',
    message: ERROR_MESSAGES.STYLE.GENERATION_FAILED,
    action: 'Try Again',
  };
};

// Default export for the error handling module
const errorHandling = {
  ImageProcessingError,
  APIError,
  StyleSelectionError,
  ERROR_MESSAGES,
  handleImageError,
  handleAPIError,
  handleStyleError
};

export default errorHandling; 