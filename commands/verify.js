/**
 * Discord Email Verification Bot - Verification Command Handlers
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

const { 
  QUARANTINE_ROLE_ID, 
  VERIFIED_ROLE_ID,
  WELCOME_CHANNEL_ID,
  CODE_EXPIRATION,
  MAX_VERIFICATIONS_PER_EMAIL
} = require('../config');
const storage = require('../storage');
const { formatTimeLeft, generateVerificationCode } = require('../utils');
const { sendVerificationEmail } = require('../emailer');

// In-memory store for pending verifications
const pendingVerifications = new Map();

/**
 * Handle the /verify command
 * @param {object} interaction - Discord interaction object
 * @returns {Promise<void>}
 */
async function handleVerifyCommand(interaction) {
  const member = interaction.member;
  
  // If user is already verified, do nothing
  if (!member.roles.cache.has(QUARANTINE_ROLE_ID)) {
    return interaction.reply({
      content: '✅ You\'re already verified! Enjoy the server!',
      ephemeral: true
    });
  }
  
  const email = interaction.options.getString('email')?.toLowerCase().trim();
  if (!email) {
    return interaction.reply({
      content: '❌ Please provide a valid email address.',
      ephemeral: true
    });
  }
  
  // Check if email is from allowed domain
  if (!storage.isAllowedDomain(email)) {
    const domainList = storage.getAllowedDomains().join(", ");
    return interaction.reply({
      content: `❌ Sorry, we only accept email addresses from these domains: ${domainList}. Please use your educational email address.`,
      ephemeral: true
    });
  }
  
  // Check total verifications
  const verifiedCount = await storage.getEmailVerificationCount(email);
  if (verifiedCount >= MAX_VERIFICATIONS_PER_EMAIL) {
    return interaction.reply({
      content: `❌ This email has reached the maximum of ${MAX_VERIFICATIONS_PER_EMAIL} verifications.\n\n**Need help?** Please contact a server admin by sending them a direct message. They can use \`/admin resetemail\` to allow your email to be used again.`,
      ephemeral: true
    });
  }
  
  // Throttle repeated requests from the same user
  if (pendingVerifications.has(interaction.user.id)) {
    const existing = pendingVerifications.get(interaction.user.id);
    const elapsed = Date.now() - existing.timestamp;
    
    if (elapsed < 5 * 60 * 1000) {
      const timeLeft = formatTimeLeft(5 * 60 * 1000 - elapsed);
      return interaction.reply({
        content: `⏳ You recently requested a verification code. Please wait ${timeLeft} before requesting a new one.`,
        ephemeral: true
      });
    }
  }
  
  // Generate a new code, store it, and send the email
  const code = generateVerificationCode();
  pendingVerifications.set(interaction.user.id, {
    email,
    code,
    timestamp: Date.now(),
    attempts: 0
  });
  
  await storage.saveCodeToStorage(interaction.user.id, email, code);
  const emailSent = await sendVerificationEmail(email, code);
  
  if (emailSent) {
    return interaction.reply({
      content: `📧 **Great! I've sent a verification code to ${email}**\n\n📱 Please check your inbox (and spam/junk folders) for an email from PLACEHOLDER Discord Verification.\n\n✅ Once you have the code, use the \`/verifycode\` command to complete your verification.\n\nExample: \`/verifycode code:ABC123\``,
      ephemeral: true
    });
  } else {
    pendingVerifications.delete(interaction.user.id);
    return interaction.reply({
      content: '❌ There was an error sending the verification email. Please try again later or contact a server admin for assistance.',
      ephemeral: true
    });
  }
}

/**
 * Handle the /verifycode command
 * @param {object} interaction - Discord interaction object
 * @returns {Promise<void>}
 */
async function handleVerifyCodeCommand(interaction) {
  const userId = interaction.user.id;
  const data = pendingVerifications.get(userId);
  
  if (!data) {
    return interaction.reply({
      content: `❓ I don't see any pending verification for you. Please use the \`/verify\` command first to request a verification code.`,
      ephemeral: true
    });
  }
  
  // Check if the code has expired
  const now = Date.now();
  if (now - data.timestamp > CODE_EXPIRATION) {
    pendingVerifications.delete(userId);
    return interaction.reply({
      content: `⏰ Your verification code has expired. Please use the \`/verify\` command again to request a new code.`,
      ephemeral: true
    });
  }
  
  data.attempts += 1;
  if (data.attempts > 3) {
    pendingVerifications.delete(userId);
    return interaction.reply({
      content: `🔒 You've made too many incorrect attempts. Please use the \`/verify\` command again to request a new code.`,
      ephemeral: true
    });
  }
  
  const submittedCode = interaction.options.getString('code')?.toUpperCase();
  if (submittedCode === data.code) {
    try {
      // Remove quarantine role and add verified role
      const member = interaction.member;
      await member.roles.remove(QUARANTINE_ROLE_ID);
      const verifiedRole = member.guild.roles.cache.get(VERIFIED_ROLE_ID);
      
      if (verifiedRole) {
        await member.roles.add(verifiedRole);
        console.log(`[verifycode] Verified ${member.user.tag}`);
      } else {
        console.error(`[verifycode] Verified role not found: ${VERIFIED_ROLE_ID}`);
      }
      
      // Move code from "pending" to "used"
      await storage.moveToUsedCodes(userId, data.email, data.code);
      pendingVerifications.delete(userId);
      
      // Send welcome message to the welcome channel
      try {
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (welcomeChannel) {
          await welcomeChannel.send({
            content: `🎓 Please welcome **${member.user.username}** to the PLACEHOLDER community! They've just completed verification and joined our server.`
          });
        }
      } catch (error) {
        console.error('[verifycode] Error sending welcome message:', error);
      }
      
      return interaction.reply({
        content: '🎉 **Verification successful!** Welcome to the PLACEHOLDER Discord community! You now have full access to the server. Enjoy connecting with your fellow students!',
        ephemeral: true
      });
    } catch (error) {
      console.error('[verifycode] Error verifying user:', error);
      return interaction.reply({
        content: '❌ There was an error completing your verification. Please contact a server admin for assistance.',
        ephemeral: true
      });
    }
  } else {
    const attemptsLeft = 3 - data.attempts;
    return interaction.reply({
      content: `❌ That code doesn't match what we sent you. You have ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left.\n\n📋 Please double-check and try again, or use \`/verify\` to request a new code.`,
      ephemeral: true
    });
  }
}

module.exports = {
  handleVerifyCommand,
  handleVerifyCodeCommand,
  // Export for testing
  pendingVerifications
};
