# Discord Email Verification Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord.js](https://img.shields.io/badge/discord.js-v13-blue.svg)](https://discord.js.org)
[![AWS S3](https://img.shields.io/badge/AWS-S3-orange.svg)](https://aws.amazon.com/s3/)
[![SendGrid](https://img.shields.io/badge/SendGrid-Email-green.svg)](https://sendgrid.com/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-green.svg)](https://nodejs.org)


## Features
- **Email Verification**: Validates users through educational email addresses
- **Domain Control**: Configurable list of allowed email domains
- **Flexible Storage**: Store verification data locally or in AWS S3
- **No AWS Required**: Can run completely without AWS infrastructure
- **Verification Limits**: Caps each email at two total verifications
- **Admin Controls**: Administrative commands for managing domains and email usage
- **Quarantine System**: Automatically quarantines new members until verified


## Code Structure
The bot is organized into modular components for better maintainability:

- index.js - Main entry point that initializes the bot
- config.js - Centralized configuration and environment settings
- utils.js - Utility functions for code generation, time formatting, etc.
- storage.js - Handles data persistence (local files or S3)
- emailer.js - Email verification functionality using SendGrid
- events.js - Discord event handlers (ready, member joins, interactions)

**commands/ - Command implementations**
    - index.js - Command registration
    - admin.js - Admin command handlers
    - verify.js - User verification command handlers

## Commands

### User Commands
- `/verify <email>` - Request verification with your educational email
- `/verifycode <code>` - Submit verification code received via email

### Admin Commands
- `/admin domain-add <domain>` - Add a new allowed email domain
- `/admin domain-remove <domain>` - Remove an allowed email domain
- `/admin domain-list` - List all allowed email domains
- `/admin checkemail <email>` - Check verification history for an email
- `/admin resetemail <email>` - Reset verification count for an email
- `/admin storage-info` - Display current storage configuration

## Storage Options

The bot now supports multiple storage configurations:

1. **AWS S3 Storage**: Store all data in AWS S3 buckets (original behavior)
2. **Local Storage**: Store all data locally in the file system
3. **Hybrid Storage**: Mix and match which components use S3 or local storage

### Local Storage Structure
When using local storage, data is organized as follows:
```
/                           # Project root
├── allowed_domains.json    # Allowed email domains
└── data/                   # Data directory
    ├── pending_codes/      # Active verification codes
    └── used_codes/         # Verification history
```

## Prerequisites
- Node.js 16.x or higher
- SendGrid account for email delivery
- Discord Bot Token and appropriate permissions
- AWS account with S3 access (optional, only if using S3 storage)

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/LukeFarch/discord-email-verification.git
   cd discord-email-verification
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following configuration:
   ```
   # Discord Configuration
   DISCORD_BOT_TOKEN=your_bot_token
   SERVER_ID=your_server_id
   VERIFIED_ROLE_ID=verified_role_id
   QUARANTINE_ROLE_ID=quarantine_role_id
   VERIFICATION_CHANNEL_ID=verification_channel_id
   WELCOME_CHANNEL_ID=welcome_channel_id
   ADMIN_ROLE_ID=admin_role_id
   SERVER_NAME=Discord Server

   # SendGrid Configuration
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDGRID_FROM_EMAIL=your_from_email
   SENDGRID_FROM_NAME=Discord Verification
   
   # Storage Configuration
   USE_LOCAL_STORAGE=false                   # Set to true to use local storage for everything
   USE_LOCAL_CODES_STORAGE=false             # Set to true to store pending codes locally
   USE_LOCAL_USED_CODES_STORAGE=false        # Set to true to store used codes locally
   
   # AWS Configuration (optional if using local storage)
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your_verification_codes_bucket
   USED_CODES_BUCKET=your_used_codes_bucket
   ```

4. Run the bot:
   ```bash
   node index.js
   ```

## Running Without AWS

To run the bot completely without AWS:

1. Set the following in your `.env` file:
   ```
   USE_LOCAL_STORAGE=true
   ```

2. No AWS credentials or S3 buckets needed!

3. Run the bot normally:
   ```bash
   node index.js
   ```

## AWS EC2 Deployment Guide (Optional)

Only needed if you choose to use AWS for deployment. You can also deploy on any other hosting service.

### Setting Up an EC2 Instance
1. **Create an EC2 Instance**:
   - Log in to your AWS Management Console
   - Navigate to EC2 service
   - Click "Launch Instance"
   - Choose Amazon Linux 2 AMI (t2.micro is sufficient for this bot)
   - Configure security groups to allow SSH (port 22)
   - Create or select an existing key pair
   - Launch the instance

2. **Connect to Your Instance**:
   ```bash
   ssh -i /path/to/your-key.pem ec2-user@your-instance-public-dns
   ```

3. **Install Node.js and Git**:
   ```bash
   # Update packages
   sudo yum update -y
   
   # Install Node.js 16.x
   curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
   sudo yum install -y nodejs
   
   # Install Git
   sudo yum install -y git
   
   # Verify installations
   node -v
   npm -v
   git --version
   ```

4. **Set Up the Bot**:
   ```bash
   # Clone your repository
   git clone https://github.com/LukeFarch/discord-email-verification.git
   cd discord-email-verification
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   nano .env
   # Paste your environment variables and save (Ctrl+X, Y, Enter)
   ```

5. **Configure AWS Credentials** (only if using S3 storage):
   ```bash
   mkdir -p ~/.aws
   nano ~/.aws/credentials
   ```
   Add the following:
   ```
   [default]
   aws_access_key_id = YOUR_ACCESS_KEY
   aws_secret_access_key = YOUR_SECRET_KEY
   ```
   Save the file (Ctrl+X, Y, Enter)

### Running the Bot Persistently
1. **Install PM2 (Process Manager)**:
   ```bash
   sudo npm install -g pm2
   ```

2. **Start the Bot with PM2**:
   ```bash
   cd ~/discord-email-verification
   pm2 start index.js --name "discord-email-verification"
   ```

3. **Set PM2 to Start on System Boot**:
   ```bash
   pm2 startup
   # Run the command that PM2 outputs
   pm2 save
   ```

### Monitoring and Management
- **View logs**:
  ```bash
  pm2 logs discord-email-verification
  ```
- **Restart the bot**:
  ```bash
  pm2 restart discord-email-verification
  ```
- **Update the bot**:
  ```bash
  cd ~/discord-email-verification
  git pull
  npm install
  pm2 restart discord-email-verification
  ```

## AWS S3 Bucket Setup (Optional)

Only required if using S3 storage options.

1. **Create S3 Buckets**:
   - Create two S3 buckets:
     - One for pending verification codes (S3_BUCKET_NAME)
     - One for used verification codes (USED_CODES_BUCKET)

2. **IAM Policy**:
   Create an IAM user with the following policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:ListBucket",
           "s3:DeleteObject"
         ],
         "Resource": [
           "arn:aws:s3:::your-verification-codes-bucket",
           "arn:aws:s3:::your-verification-codes-bucket/*",
           "arn:aws:s3:::your-used-codes-bucket",
           "arn:aws:s3:::your-used-codes-bucket/*"
         ]
       }
     ]
   }
   ```

## Security Considerations

### Email Data Protection
The bot stores verification history including email addresses. Consider these security recommendations:

- **Data Encryption**: If using local storage, consider encrypting the data directory
- **Access Controls**: Restrict access to the storage directories or S3 buckets
- **Regular Cleanups**: Implement regular cleanups of old verification data
- **Secure Your .env File**: Ensure your environment variables file is not accessible

**Note**: The current implementation does not include encryption for locally stored emails. If your server handles sensitive or regulated data, consider implementing additional security measures or using S3 with server-side encryption.

## Functionality
The bot implements the following workflow:

1. **Member Joins**: New Discord members are assigned the quarantine role automatically
2. **Verification Request**: Users request verification with `/verify email:user@example.edu`
3. **Email Delivery**: A verification code is sent to the provided email if domain is allowed
4. **Code Submission**: Users submit the code via `/verifycode code:ABC123`
5. **Role Assignment**: Upon successful verification, quarantine role is removed and verified role is assigned
6. **Welcome Message**: A welcome message is sent to the designated channel

### Security Features
- Verification codes expire after 30 minutes
- Limits retries to 3 attempts before requiring a new code
- Caps each email address at 2 total verifications
- Admin commands allow management of email domains and verification history
- Flexible storage options for verification data

## License
This project is licensed under the MIT License - see the LICENSE file for details.
