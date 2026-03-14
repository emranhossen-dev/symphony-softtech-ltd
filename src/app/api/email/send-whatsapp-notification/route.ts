import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    // Check if email configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email configuration not found. Skipping email notification.');
      console.log('To enable email notifications, set SMTP_HOST, SMTP_USER, SMTP_PASS, and ADMIN_EMAIL in your environment variables.');
      return NextResponse.json({
        success: true,
        message: 'Email notification skipped (not configured)',
      });
    }

    // Dynamic import to avoid module not found errors
    let nodemailer;
    try {
      nodemailer = await import('nodemailer');
    } catch (importError) {
      console.error('Nodemailer not available:', importError);
      return NextResponse.json({
        success: true,
        message: 'Email notification skipped (nodemailer not installed)',
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'admin@symphonyinstitute.com',
      subject: `📩 New WhatsApp Message - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">
              📩 New WhatsApp Message
            </h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555; width: 100px;">Name:</td>
                  <td style="padding: 8px; color: #333;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px; color: #333;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold; color: #555;">Phone:</td>
                  <td style="padding: 8px; color: #333;">${phone}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">Message</h3>
              <p style="color: #333; line-height: 1.6; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 0;">
                ${message}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://wa.me/${phone.replace(/[^\d]/g, '')}" 
                 style="background: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                📱 Reply on WhatsApp
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>This message was sent from the WhatsApp widget on Symphony Institute website</p>
              <p>Time: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email notification sent successfully',
    });

  } catch (error) {
    console.error('Error sending email notification:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}
