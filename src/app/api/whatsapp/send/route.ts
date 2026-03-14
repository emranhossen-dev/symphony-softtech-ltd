import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
import { messageStore } from '@/lib/messageStore';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    // Validate input
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Store message using the message store
    const whatsappMessage = messageStore.addMessage({
      name,
      email,
      phone,
      message,
    });

    // Send WhatsApp notification to admin
    try {
      await sendWhatsAppNotification({
        to: process.env.ADMIN_WHATSAPP_NUMBER || '',
        message: `📩 New WhatsApp Message from Symphony Institute Website\n\n` +
                `👤 Name: ${name}\n` +
                `📧 Email: ${email}\n` +
                `📱 Phone: ${phone}\n` +
                `💬 Message: ${message}\n\n` +
                `📅 Time: ${new Date().toLocaleString()}\n\n` +
                `Please respond to this inquiry promptly.`,
      });
    } catch (whatsappError) {
      console.error('Failed to send WhatsApp notification:', whatsappError);
      // Continue even if WhatsApp fails
    }

    // Send email notification to admin
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send-whatsapp-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email notification');
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: whatsappMessage,
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
