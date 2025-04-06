/**
 * App Version Tracking
 * 
 * This file contains the current version of the app.
 * Update this version number whenever new code is pushed.
 * 
 * Version format: MAJOR.MINOR.PATCH
 * - MAJOR: Significant changes that may break backward compatibility
 * - MINOR: New features that maintain backward compatibility
 * - PATCH: Bug fixes and minor improvements
 */

export const APP_VERSION = '1.0.1';
export const BUILD_DATE = '2023-07-15';

/**
 * Get the full version string
 * @returns {string} The full version string
 */
export const getFullVersion = () => {
  return `v${APP_VERSION} (${BUILD_DATE})`;
};

/**
 * Get the version number
 * @returns {string} The version number
 */
export const getVersion = () => {
  return APP_VERSION;
};

/**
 * Get the build date
 * @returns {string} The build date
 */
export const getBuildDate = () => {
  return BUILD_DATE;
}; 