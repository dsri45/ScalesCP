/**
 * API Configuration
 * 
 * This file contains configuration for external APIs used in the application:
 * - Google Cloud Vision API for receipt text recognition
 * - Other potential API configurations
 */

/**
 * Google Cloud Vision API Key
 * 
 * This key is used for the receipt scanning functionality to:
 * - Extract text from receipt images
 * - Perform OCR (Optical Character Recognition)
 * - Process receipt data
 * 
 * Note: In a production environment, this should be stored securely
 * and not committed to version control. Consider using environment
 * variables or a secure configuration service.
 */
export const GOOGLE_VISION_API_KEY = 'YOUR_API_KEY_HERE';

/**
 * Google Cloud Vision API Endpoint
 * 
 * The base URL for the Google Cloud Vision API.
 * This is used to construct the full API request URL.
 */
export const GOOGLE_VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * API Request Headers
 * 
 * Common headers used across API requests
 */
export const API_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * API Timeout Configuration
 * 
 * Timeout settings for API requests in milliseconds
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * API Error Messages
 * 
 * Standard error messages for API-related issues
 */
export const API_ERRORS = {
  INVALID_API_KEY: 'Invalid API key. Please check your configuration.',
  RATE_LIMIT_EXCEEDED: 'API rate limit exceeded. Please try again later.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// Add other API configurations here as needed 