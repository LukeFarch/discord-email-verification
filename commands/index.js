/**
 * Discord Email Verification Bot - Command Registration
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { SERVER_ID } = require('../config');

/**
 * Register slash commands with Discord
 * @param {object} client - Discord client instance
 * @returns {Promise<void>}
 */
async function registerCommands(client) {
  const commands = [
    // /verify command
    new SlashCommandBuilder()
      .setName('verify')
      .setDescription('Verify your educational email address')
      .addStringOption(option =>
        option.setName('email')
          .setDescription('Your educational email address')
          .setRequired(true))
      .toJSON(),
    
    // /verifycode command
    new SlashCommandBuilder()
      .setName('verifycode')
      .setDescription('Submit your verification code')
      .addStringOption(option =>
        option.setName('code')
          .setDescription('Your verification code')
          .setRequired(true))
      .toJSON(),
    
    // /admin commands
    new SlashCommandBuilder()
      .setName('admin')
      .setDescription('Admin commands for bot management')
      .addSubcommand(subcommand =>
        subcommand
          .setName('checkemail')
          .setDescription('Check email verification history')
          .addStringOption(option =>
            option.setName('email')
              .setDescription('Email address to check')
              .setRequired(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('resetemail')
          .setDescription('Reset an email to allow verification again')
          .addStringOption(option =>
            option.setName('email')
              .setDescription('Email address to reset')
              .setRequired(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('domain-add')
          .setDescription('Add a new allowed email domain')
          .addStringOption(option =>
            option.setName('domain')
              .setDescription('Email domain to add (e.g., example.edu)')
              .setRequired(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('domain-remove')
          .setDescription('Remove an allowed email domain')
          .addStringOption(option =>
            option.setName('domain')
              .setDescription('Email domain to remove')
              .setRequired(true)))
      .addSubcommand(subcommand =>
        subcommand
          .setName('domain-list')
          .setDescription('List all allowed email domains'))
      .addSubcommand(subcommand =>
        subcommand
          .setName('storage-info')
          .setDescription('Show current storage configuration information'))
      .toJSON()
  ];
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    const rest = new REST({ version: '9' }).setToken(client.token);
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, SERVER_ID),
      { body: commands }
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
    throw error;
  }
}

module.exports = {
  registerCommands
};
