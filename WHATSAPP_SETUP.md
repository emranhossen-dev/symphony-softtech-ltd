# WhatsApp Widget Setup Guide

## 🚀 Overview
This WhatsApp widget system allows customers to send messages from your website, which are then:
- Saved to your database
- Sent as WhatsApp notifications to admin
- Sent as email notifications
- Viewable in admin and employee panels

## 📋 Database Setup
1. Run the migration to create the WhatsApp messages table:
```bash
npx prisma migrate dev
```

## 🔧 Environment Variables
Add these to your `.env` file:

```env
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
ADMIN_WHATSAPP_NUMBER=your_admin_phone_number

# Twilio (Alternative WhatsApp Service)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@symphonyinstitute.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 WhatsApp Setup Options

### Option 1: WhatsApp Business API (Recommended)
1. Create a WhatsApp Business Account
2. Get your phone number ID and access token
3. Set up the Meta Business Suite
4. Configure the environment variables above

### Option 2: Twilio WhatsApp (Easier Setup)
1. Sign up for Twilio account
2. Get your Account SID and Auth Token
3. Purchase a Twilio WhatsApp number
4. Configure the Twilio environment variables

### Option 3: Basic WhatsApp Web Links (Fallback)
The system will automatically fall back to WhatsApp Web links if API setup is not configured.

## 🎯 How It Works

### Customer Experience:
1. Customer clicks WhatsApp widget on website
2. Fills out name, email, phone, and message
3. Message is saved to database
4. Admin receives WhatsApp notification
5. Admin receives email notification
6. Customer sees success message

### Admin/Employee Experience:
1. View messages in admin/employee panels
2. See read/unread status
3. Reply directly via WhatsApp
4. Mark messages as read
5. Delete messages (admin only)

## 🛠 Integration Points

### Frontend Components:
- `WhatsAppWidget.tsx` - Main widget component
- `WhatsAppMessages.tsx` (admin) - Admin message viewer
- `WhatsAppMessages.tsx` (employee) - Employee message viewer

### Backend APIs:
- `/api/whatsapp/send` - Send new messages
- `/api/whatsapp/messages` - Fetch/update messages
- `/api/email/send-whatsapp-notification` - Email notifications

### Database:
- `whatsapp_messages` table stores all messages

## 🎨 Features

### Widget Features:
- Beautiful animated WhatsApp button
- Unread message count badge
- Form validation
- Success notifications
- Responsive design
- Smooth animations

### Admin Panel Features:
- View all messages
- Filter by read/unread status
- Mark messages as read
- Delete messages
- Reply via WhatsApp
- Real-time updates

### Employee Panel Features:
- View messages (read-only)
- Filter by read/unread status
- Mark messages as read
- Reply via WhatsApp

## 🔍 Testing

1. Test the widget on your website
2. Check database for messages
3. Verify email notifications
4. Test WhatsApp notifications (if configured)
5. Test admin/employee panels

## 🚀 Deployment

1. Set all environment variables in production
2. Run database migrations
3. Test all functionality
4. Monitor message logs

## 📞 Support

For issues:
1. Check environment variables
2. Verify database connection
3. Check API logs
4. Test WhatsApp API credentials

## 🔄 Maintenance

- Regularly check for unread messages
- Monitor WhatsApp API usage
- Update contact information as needed
- Clean up old messages periodically
