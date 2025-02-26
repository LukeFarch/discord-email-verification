/**
 * Discord Email Verification Bot - Main Entry Point
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

// Load configuration and modules
const { client, token, SERVER_ID } = require('./config');
const storage = require('./storage');
const { registerCommands } = require('./commands');
const setupEventHandlers = require('./events');

// Initialization function
async function initialize() {
  console.log('Initializing Discord Email Verification Bot...');
  
  // Ensure storage is ready
  await storage.initialize();
  
  // Set up event handlers
  setupEventHandlers(client);
  
  // Log in to Discord
  try {
    await client.login(token);
    console.log(`Bot logged in successfully`);
    
    // Register slash commands after login is successful
    await registerCommands(client);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

// Start the bot
initialize();
