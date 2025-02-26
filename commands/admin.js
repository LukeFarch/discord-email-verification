/**
 * Discord Email Verification Bot - Admin Command Handlers
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

const { hasAdminRole } = require('../utils');
const storage = require('../storage');

/**
 * Handle all admin commands
 * @param {object} interaction - Discord interaction object
 * @returns {Promise<void>}
 */
async function handleAdminCommand(interaction) {
  // Check if user has admin role
  if (!hasAdminRole(interaction.member)) {
    return interaction.reply({
      content: '❌ Sorry, only server administrators can use these commands.',
      ephemeral: true
    });
  }
  
  const subcommand = interaction.options.getSubcommand();
  
  switch (subcommand) {
    case 'storage-info':
      return handleStorageInfo(interaction);
    case 'domain-add':
      return handleDomainAdd(interaction);
    case 'domain-remove':
      return handleDomainRemove(interaction);
    case 'domain-list':
      return handleDomainList(interaction);
    case 'checkemail':
      return handleCheckEmail(interaction);
    case 'resetemail':
      return handleResetEmail(interaction);
    default:
      return interaction.reply({
        content: `❌ Unknown subcommand: ${subcommand}`,
        ephemeral: true
      });
  }
}

/**
 * Handle the storage-info subcommand
 * @param {object} interaction - Discord interaction object
 */
async function handleStorageInfo(interaction) {
  const info = storage.getStorageInfo();
  let message = `📊 **Storage Configuration**\n\n`;
  message += `- Domains: **${info.domains}**\n`;
  message += `- Pending Codes: **${info.pendingCodes}**\n`;
  message += `- Used Codes: **${info.usedCodes}**\n\n`;
  
  if (info.domains === 'Local' || info.pendingCodes === 'Local' || info.usedCodes === 'Local') {
    message += `**Local Storage Paths:**\n`;
    if (info.domains === 'Local') message += `- Domains: \`${info.localDomainsPath}\`\n`;
    if (info.pendingCodes === 'Local') message += `- Pending Codes: \`${info.localCodesDir}\`\n`;
    if (info.usedCodes === 'Local') message += `- Used Codes: \`${info.localUsedCodesDir}\`\n`;
  }
  
  if (info.domains === 'S3' || info.pendingCodes === 'S3' || info.usedCodes === 'S3') {
    message += `\n**S3 Buckets:**\n`;
    if (info.domains === 'S3' || info.pendingCodes === 'S3') message += `- Main Bucket: \`${info.s3Bucket}\`\n`;
    if (info.usedCodes === 'S3') message += `- Used Codes Bucket: \`${info.s3UsedCodesBucket}\`\n`;
  }
  
  return interaction.reply({
    content: message,
    ephemeral: true
  });
}

/**
 * Handle the domain-add subcommand
 * @param {object} interaction - Discord interaction object
 */
async function handleDomainAdd(interaction) {
  const domain = interaction.options.getString('domain')?.toLowerCase().trim();
  if (!domain) {
    return interaction.reply({
      content: '❌ Please provide a valid domain name (e.g., university.edu).',
      ephemeral: true
    });
  }
  
  // Validate domain format
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return interaction.reply({
      content: '❌ Invalid domain format. Please provide a valid domain like "university.edu".',
      ephemeral: true
    });
  }
  
  await interaction.deferReply({ ephemeral: true });
  
  // Check if domain already exists
  const allowedDomains = storage.getAllowedDomains();
  if (allowedDomains.includes(domain)) {
    return interaction.editReply({
      content: `📝 The domain "${domain}" is already in the allowed list.`,
      ephemeral: true
    });
  }
  
  // Add domain to list
  const newDomains = [...allowedDomains, domain];
  const success = await storage.saveAllowedDomains(newDomains);
  
  if (success) {
    return interaction.editReply({
      content: `✅ Successfully added "${domain}" to the allowed domains list.`,
      ephemeral: true
    });
  } else {
    return interaction.editReply({
      content: `❌ Error adding domain. Please try again or check the logs.`,
      ephemeral: true
    });
  }
}

/**
 * Handle the domain-remove subcommand
 * @param {object} interaction - Discord interaction object
 */
async function handleDomainRemove(interaction) {
  const domain = interaction.options.getString('domain')?.toLowerCase().trim();
  if (!domain) {
    return interaction.reply({
      content: '❌ Please provide a domain to remove.',
      ephemeral: true
    });
  }
  
  await interaction.deferReply({ ephemeral: true });
  
  // Check if domain exists
  const allowedDomains = storage.getAllowedDomains();
  if (!allowedDomains.includes(domain)) {
    return interaction.editReply({
      content: `❌ The domain "${domain}" is not in the allowed list.`,
      ephemeral: true
    });
  }
  
  // Don't allow removing all domains
  if (allowedDomains.length === 1 && allowedDomains[0] === domain) {
    return interaction.editReply({
      content: `❌ Cannot remove the last domain. Add another domain first.`,
      ephemeral: true
    });
  }
  
  // Remove domain from list
  const newDomains = allowedDomains.filter(d => d !== domain);
  const success = await storage.saveAllowedDomains(newDomains);
  
  if (success) {
    return interaction.editReply({
      content: `✅ Successfully removed "${domain}" from the allowed domains list.`,
      ephemeral: true
    });
  } else {
    return interaction.editReply({
      content: `❌ Error removing domain. Please try again or check the logs.`,
      ephemeral: true
    });
  }
}

/**
 * Handle the domain-list subcommand
 * @param {object} interaction - Discord interaction object
 */
async function handleDomainList(interaction) {
  await interaction.deferReply({ ephemeral: true });
  
  const allowedDomains = storage.getAllowedDomains();
  if (allowedDomains.length === 0) {
    return interaction.editReply({
      content: '⚠️ No domains are currently allowed. Please add at least one domain.',
      ephemeral: true
    });
  }
  
  const domainList = allowedDomains.map(d => `- ${d}`).join('\n');
  return interaction.editReply({
    content: `📋 **Currently Allowed Email Domains:**\n${domainList}`,
    ephemeral: true
  });
}

/**
 * Handle the checkemail subcommand
 * @param {object} interaction - Discord interaction object
 */
async function handleCheckEmail(interaction) {
  const email = interaction.options.getString('email')?.toLowerCase().trim();
  if (!email) {
    return interaction.reply({
      content: '❌ Please provide an email address to check.',
      ephemeral: true
    });
  }
  
  await interaction.deferReply({ ephemeral: true });
  
  const verifiedCount = await storage.getEmailVerificationCount(email);
  const maxVerifications = require('../config').MAX_VERIFICATIONS_PER_EMAIL;
  
  let replyText = `📧 **Email:** ${email}\n`;
  replyText += `🔢 **Total Verifications:** ${verifiedCount}/${maxVerifications}\n`;
  replyText += `💾 **Storage Method:** ${storage.getStorageInfo().usedCodes}\n`;
  
  // Check if the email domain is allowed
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain) {
    const isAllowed = storage.isAllowedDomain(email);
    replyText += `🌐 **Domain Status:** ${isAllowed ? '✅ Allowed' : '❌ Not Allowed'}\n`;
  }
  
  if (verifiedCount >= maxVerifications) {
    replyText += `\n⚠️ This email has reached its maximum verification limit.`;
  }
  
  return interaction.editReply({ content: replyText, ephemeral: true });
}

/**
 * Handle the resetemail subcommand
 * @param {object} interaction - Discord interaction object
 */
async function handleResetEmail(interaction) {
  const email = interaction.options.getString('email')?.toLowerCase().trim();
  if (!email) {
    return interaction.reply({
      content: '❌ Please provide an email address to reset.',
      ephemeral: true
    });
  }
  
  await interaction.deferReply({ ephemeral: true });
  const result = await storage.resetEmail(email);
  
  if (result.success) {
    return interaction.editReply({
      content: `✅ Successfully reset verification for ${email}! Deleted ${result.deletedCount} record(s). This email can now be used for verification again.`,
      ephemeral: true
    });
  } else {
    return interaction.editReply({
      content: `❌ Unable to reset ${email}: ${result.reason || 'Unknown error'}`,
      ephemeral: true
    });
  }
}

module.exports = {
  handleAdminCommand
};
