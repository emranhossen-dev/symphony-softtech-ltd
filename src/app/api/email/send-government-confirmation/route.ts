import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, courseName, subject } = await request.json();

    if (!email || !fullName || !courseName) {
      return NextResponse.json({
        success: false,
        error: 'Required fields missing'
      }, { status: 400 });
    }

    // For now, just log the email details (you can integrate with actual email service later)
    console.log('Government Course Confirmation Email:', {
      to: email,
      subject: `Government Course Registration Confirmation - ${courseName}`,
      fullName,
      courseName,
      subject: subject || 'Interested in this course'
    });

    // Mock email sending success
    // In production, you would integrate with:
    // - Nodemailer with SMTP
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Or any email service

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
      emailDetails: {
        to: email,
        subject: `Government Course Registration Confirmation - ${courseName}`,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send confirmation email',
      details: errorMessage
    }, { status: 500 });
  }
}
