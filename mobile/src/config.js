/**
 * App Configuration
 *
 * __DEV__ is automatically set by React Native:
 *   - true  → running via Metro (development / emulator / hot-reload)
 *   - false → production build (release APK / App Store bundle)
 */

const DEV_API_URL  = 'http://10.0.2.2:5000/api';   // Android emulator → host machine
const PROD_API_URL = 'https://gadgetpro-naoq.onrender.com/api';

const DEV_BASE_URL  = 'http://10.0.2.2:5000';
const PROD_BASE_URL = 'https://gadgetpro-naoq.onrender.com';

export const API_URL  = __DEV__ ? DEV_API_URL  : PROD_API_URL;
export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;

/**
 * Resolves a product/order image path to a full URL.
 * If the image is already an absolute URL (http/https), return it as-is.
 * Otherwise prepend the correct base URL.
 *
 * @param {string|undefined} imagePath - e.g. "/uploads/image.jpg" or "https://..."
 * @returns {string}
 */
export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${BASE_URL}${imagePath}`;
};
