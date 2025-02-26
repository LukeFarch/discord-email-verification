/**
 * Discord Email Verification Bot - Email Functionality
 * 
 * @author Luke J Farchione | J4eva | 2/25/2025
 * @license MIT
 */

const sgMail = require('@sendgrid/mail');
const { 
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  SENDGRID_FROM_NAME,
  SERVER_NAME
} = require('./config');

// Configure SendGrid with API key
sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send verification email to user
 * @param {string} email - Recipient email address
 * @param {string} code - Verification code
 * @returns {Promise<boolean>} True if email sent successfully
 */
async function sendVerificationEmail(email, code) {
  console.log(`[sendVerificationEmail] Sending code ${code} to ${email}`);
  
  const subject = `Your ${SERVER_NAME} Discord Verification Code`;
  const text = `Your verification code is: ${code}\n\nThis code will expire in 30 minutes.\n\nIf you didn't request this code, please ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00447c;">${SERVER_NAME} Discord Verification</h2>
      <p>Hi there! Thanks for joining our ${SERVER_NAME} Discord community!</p>
      <p>Your verification code is:</p>
      <div style="font-size: 24px; font-weight: bold; background-color: #f5f5f5; padding: 10px; margin: 15px 0; border-radius: 4px; text-align: center;">
        ${code}
      </div>
      <p>This code will expire in 30 minutes.</p>
      <p>Simply return to Discord and use the <strong>/verifycode</strong> command with this code to get full access to the server.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p style="color: #777; font-size: 12px; margin-top: 20px;">
        This is an automated message from ${SERVER_NAME}. 
        Please check your spam folder if you don't see this email in your inbox.
      </p>
    </div>
  `;
  
  const msg = {
    to: email,
    from: {
      email: SENDGRID_FROM_EMAIL,
      name: SENDGRID_FROM_NAME
    },
    subject,
    text,
    html,
    tracking_settings: {
      click_tracking: { enable: false },
      open_tracking: { enable: false }
    }
  };
  
  try {
    await sgMail.send(msg);
    console.log(`[sendVerificationEmail] Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('[sendVerificationEmail] Error:', error.response ? error.response.body : error.message);
    return false;
  }
}

module.exports = {
  sendVerificationEmail
};
