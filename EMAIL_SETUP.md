# Email Configuration for Admission System

This document explains how to configure email sending for the automatic admission email feature.

## Overview

When a student is admitted from the admin panel, the system now automatically:
1. Creates a user account with a temporary password
2. Sends an email to the student with their login credentials

## Required Environment Variables

Your `.env` file already has the email configuration section. Update these variables:

```env
# EMAIL (OPTIONAL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
```

**Note:** You already have `NEXT_PUBLIC_APP_URL=http://localhost:3000` in your .env file.

## Email Provider Setup

### For Gmail:

1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account Settings > Security > App Passwords
3. Generate a new App Password for "Mail"
4. Use the generated password as `SMTP_PASS`
5. Your email address goes in `SMTP_USER`

### For Other Providers:

**Outlook/Hotmail:**
```
EMAIL_HOST="smtp.office365.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
```

**SendGrid:**
```
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
```

**AWS SES:**
```
EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-aws-ses-smtp-username"
EMAIL_PASSWORD="your-aws-ses-smtp-password"
```

## Testing

To test if your email configuration is working, you can create a test API endpoint or check the server logs when admitting a student.

## Email Content

The admission email includes:
- Congratulations message
- Course name
- Login credentials (email and temporary password)
- Link to login page
- Instructions to change password after first login

## Troubleshooting

**Email not sending:**
- Check server logs for error messages
- Verify EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASSWORD are correct
- Ensure your email provider allows SMTP access
- For Gmail, make sure you're using an App Password, not your regular password

**Authentication errors:**
- Verify credentials are correct
- For Gmail, regenerate the App Password
- Check if your email provider requires additional security settings

**Connection timeout:**
- Check firewall settings
- Verify EMAIL_PORT is correct
- Some providers require SSL (EMAIL_SECURE="true") on port 465
