/**
 * Discord Email Verification Bot - Event Handlers
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

const { 
  VERIFICATION_CHANNEL_ID, 
  QUARANTINE_ROLE_ID, 
  SERVER_ID 
} = require('./config');
const { handleVerifyCommand, handleVerifyCodeCommand } = require('./commands/verify');
const { handleAdminCommand } = require('./commands/admin');

/**
 * Setup Discord event handlers
 * @param {object} client - Discord client instance
 */
function setupEventHandlers(client) {
  // Bot ready event
  client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    
    // Log storage configuration
    const storageInfo = require('./storage').getStorageInfo();
    console.log('Storage Configuration:');
    console.log(`- Domains storage: ${storageInfo.domains}`);
    console.log(`- Pending codes storage: ${storageInfo.pendingCodes}`);
    console.log(`- Used codes storage: ${storageInfo.usedCodes}`);
    
    // Store command IDs when the bot starts up for proper mention formatting
    try {
      const guild = client.guilds.cache.get(SERVER_ID);
      if (guild) {
        const commands = await guild.commands.fetch();
        console.log(`[ready] Loaded ${commands.size} slash commands`);
      }
    } catch (error) {
      console.error('[ready] Error fetching commands:', error);
    }
  });
  
  // New member join event
  client.on('guildMemberAdd', async (member) => {
    try {
      const quarantineRole = member.guild.roles.cache.get(QUARANTINE_ROLE_ID);
      if (quarantineRole) {
        await member.roles.add(quarantineRole);
        console.log(`[guildMemberAdd] Quarantined new member: ${member.user.tag}`);
        
        const verificationChannel = member.guild.channels.cache.get(VERIFICATION_CHANNEL_ID);
        if (verificationChannel) {
          await verificationChannel.send({
            content: `👋 **Welcome to PLACEHOLDER's Discord community, ${member}!**\n\nTo get verified, please use the \`/verify\` command with your school email address.\n\nExample: \`/verify email:your.name@CHANGEME.ME\``
          });
        }
      }
    } catch (error) {
      console.error('[guildMemberAdd] Error:', error);
    }
  });
  
  // Slash command interaction event
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const { commandName } = interaction;
    
    try {
      switch (commandName) {
        case 'admin':
          await handleAdminCommand(interaction);
          break;
        case 'verify':
          await handleVerifyCommand(interaction);
          break;
        case 'verifycode':
          await handleVerifyCodeCommand(interaction);
          break;
        default:
          await interaction.reply({
            content: `❌ Unknown command: ${commandName}`,
            ephemeral: true
          });
      }
    } catch (error) {
      console.error(`[interactionCreate] Error handling command "${commandName}":`, error);
      
      // Try to respond to the user if we haven't already
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ An error occurred while processing your command. Please try again later or contact a server admin.',
          ephemeral: true
        });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({
          content: '❌ An error occurred while processing your command. Please try again later or contact a server admin.',
        });
      }
    }
  });
  
  // Error event
  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });
}

module.exports = setupEventHandlers;
