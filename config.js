/**
 * Discord Email Verification Bot - Configuration
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

// Required packages
const { Client, Intents } = require('discord.js');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

// Discord Bot configuration
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES
  ],
  partials: ['CHANNEL']
});

// Environment Variables
const token = process.env.DISCORD_BOT_TOKEN;
const SERVER_ID = process.env.SERVER_ID;
const VERIFICATION_CHANNEL_ID = process.env.VERIFICATION_CHANNEL_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID || VERIFICATION_CHANNEL_ID;
const QUARANTINE_ROLE_ID = process.env.QUARANTINE_ROLE_ID;
const VERIFIED_ROLE_ID = process.env.VERIFIED_ROLE_ID;
const SERVER_NAME = process.env.SERVER_NAME || "PLACEHOLDER Discord Server";
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

// Storage configuration
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';
const USE_LOCAL_CODES_STORAGE = process.env.USE_LOCAL_CODES_STORAGE === 'true' || USE_LOCAL_STORAGE;
const USE_LOCAL_USED_CODES_STORAGE = process.env.USE_LOCAL_USED_CODES_STORAGE === 'true' || USE_LOCAL_STORAGE;

// S3 configuration
const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const USED_CODES_BUCKET = process.env.USED_CODES_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Initialize AWS S3 only if we're using it
const s3 = (!USE_LOCAL_STORAGE || !USE_LOCAL_CODES_STORAGE || !USE_LOCAL_USED_CODES_STORAGE) 
  ? new AWS.S3({ region: AWS_REGION }) 
  : null;

// Storage paths
const DOMAINS_KEY = 'allowed_domains.json';
const LOCAL_DOMAINS_PATH = path.join(__dirname, 'allowed_domains.json');
const LOCAL_CODES_DIR = path.join(__dirname, 'data', 'pending_codes');
const LOCAL_USED_CODES_DIR = path.join(__dirname, 'data', 'used_codes');

// Email configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "DiscordVerificationBot@example.com";
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || "PLACEHOLDER Discord Verification";

// Verification Settings
const CODE_EXPIRATION = 30 * 60 * 1000; // 30 minutes expiration
const MAX_VERIFICATIONS_PER_EMAIL = 2;

// Export all configuration
module.exports = {
  client,
  token,
  SERVER_ID,
  VERIFICATION_CHANNEL_ID,
  WELCOME_CHANNEL_ID,
  QUARANTINE_ROLE_ID,
  VERIFIED_ROLE_ID,
  SERVER_NAME,
  ADMIN_ROLE_ID,
  
  USE_LOCAL_STORAGE,
  USE_LOCAL_CODES_STORAGE,
  USE_LOCAL_USED_CODES_STORAGE,
  
  BUCKET_NAME,
  USED_CODES_BUCKET,
  s3,
  
  DOMAINS_KEY,
  LOCAL_DOMAINS_PATH,
  LOCAL_CODES_DIR,
  LOCAL_USED_CODES_DIR,
  
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  SENDGRID_FROM_NAME,
  
  CODE_EXPIRATION,
  MAX_VERIFICATIONS_PER_EMAIL
};
