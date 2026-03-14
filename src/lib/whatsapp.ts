interface WhatsAppMessage {
  to: string;
  message: string;
}

export async function sendWhatsAppNotification({ to, message }: WhatsAppMessage) {
  try {
    // Check if WhatsApp API is configured
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.ADMIN_WHATSAPP_NUMBER) {
      console.log('WhatsApp API not configured. Skipping WhatsApp notification.');
      console.log('To enable WhatsApp notifications, set WHATSAPP_ACCESS_TOKEN and ADMIN_WHATSAPP_NUMBER in your environment variables.');
      return null;
    }

    // Using WhatsApp Business API (you need to set this up)
    const whatsappApiUrl = 'https://graph.facebook.com/v18.0/your-phone-number-id/messages';
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^\d]/g, ''), // Remove non-digits
      text: {
        body: message,
      },
    };

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('WhatsApp message sent successfully:', data);
    return data;

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    // Don't throw error, just log it so the system continues working
    return null;
  }
}

// Alternative: Use Twilio WhatsApp API
export async function sendWhatsAppViaTwilio({ to, message }: WhatsAppMessage) {
  try {
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
      console.log('Twilio WhatsApp not configured. Skipping Twilio notification.');
      return null;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', `whatsapp:${twilioWhatsAppNumber}`);
    formData.append('To', `whatsapp:${to.replace(/[^\d]/g, '')}`);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Twilio WhatsApp message sent successfully:', data);
    return data;

  } catch (error) {
    console.error('Error sending Twilio WhatsApp message:', error);
    // Don't throw error, just log it so the system continues working
    return null;
  }
}

// Simple WhatsApp Web link generator (fallback option)
export function generateWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
