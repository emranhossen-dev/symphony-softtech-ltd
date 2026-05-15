import { NextResponse } from 'next/server';
import { sendWhatsAppNotification, generateWhatsAppLink } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const { phone, message } = await request.json();

    // Validate input
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanedPhone = phone.replace(/[^0-9]/g, '');

    // Try to send WhatsApp message via API
    const result = await sendWhatsAppNotification({
      to: cleanedPhone,
      message: message
    });

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully via WhatsApp API',
        method: 'api'
      });
    } else {
      // API not configured, return WhatsApp Web link as fallback
      const whatsappLink = generateWhatsAppLink(cleanedPhone, message);
      return NextResponse.json({
        success: true,
        message: 'WhatsApp API not configured. Use the provided link to send via WhatsApp Web.',
        method: 'web',
        link: whatsappLink
      });
    }

  } catch (error) {
    console.error('Error sending WhatsApp reply:', error);
    
    // On error, provide WhatsApp Web link as fallback
    const { phone, message } = await request.json().catch(() => ({ phone: '', message: '' }));
    const cleanedPhone = phone?.replace(/[^0-9]/g, '') || '';
    const whatsappLink = generateWhatsAppLink(cleanedPhone, message || '');
    
    return NextResponse.json({
      success: true,
      message: 'Error sending via API. Use the provided link to send via WhatsApp Web.',
      method: 'web',
      link: whatsappLink
    });
  }
}
