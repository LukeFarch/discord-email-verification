/**
 * Discord Email Verification Bot - Utility Functions
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

const fs = require('fs');
const crypto = require('crypto');
const { ADMIN_ROLE_ID } = require('./config');

/**
 * Format milliseconds into a human-readable time string
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string
 */
function formatTimeLeft(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}${seconds > 0 ? ` and ${seconds} second${seconds !== 1 ? 's' : ''}` : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

/**
 * Ensure that a directory exists, creating it if necessary
 * @param {string} dirPath - Path to directory
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`[ensureDirectoryExists] Created directory: ${dirPath}`);
  }
}

/**
 * Generate a verification code
 * @returns {string} 8-character verification code
 */
function generateVerificationCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Check if a guild member has admin role
 * @param {object} member - Discord guild member
 * @returns {boolean} True if member has admin role
 */
function hasAdminRole(member) {
  return member.roles.cache.has(ADMIN_ROLE_ID);
}

/**
 * Check if an email is valid
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email has valid format
 */
function isValidEmail(email) {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  formatTimeLeft,
  ensureDirectoryExists,
  generateVerificationCode,
  hasAdminRole,
  isValidEmail
};
