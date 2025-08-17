# Email Service Setup Guide

This application now uses **Nodemailer** with Gmail SMTP for sending emails. This is a free and reliable solution for email functionality.

## Quick Setup

### 1. Environment Variables

Add these variables to your `.env` file:

```env
# Email Service (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

### 2. Gmail App Password Setup

**Important**: You cannot use your regular Gmail password. You must create an App Password.

#### Steps:
1. **Enable 2-Factor Authentication** on your Gmail account (required for app passwords)
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to **Security** → **2-Step Verification** → **App passwords**
4. Select **Mail** as the app type
5. Generate the app password
6. Copy the 16-character password (without spaces) to your `.env` file as `EMAIL_PASS`

### 3. Alternative Email Providers

You can also use other email providers by changing the SMTP settings:

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

## Testing

Once configured, you can test the email service using the development endpoint:

```bash
POST /api/share/test
{
  "email": "test@example.com"
}
```

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2FA is enabled on your Gmail account

2. **"Connection timeout"**
   - Check your firewall settings
   - Verify the EMAIL_HOST and EMAIL_PORT are correct

3. **"Daily sending limit exceeded"**
   - Gmail has a daily limit of 500 emails for personal accounts
   - Consider upgrading to Google Workspace for higher limits

### Security Notes:

- Never commit your `.env` file to version control
- Use App Passwords instead of regular passwords
- Consider using environment-specific email accounts for development vs production
