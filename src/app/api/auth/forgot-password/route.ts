import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email using nodemailer
async function sendEmail(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset Code - Symphony Institute of Technology',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin-bottom: 10px;">Symphony Institute of Technology</h1>
          <h2 style="color: #374151; margin-bottom: 5px;">Password Reset Code</h2>
        </div>
        
        <div style="background: #f3f4f6; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <p style="color: #6b7280; margin-bottom: 20px;">Use the code below to reset your password:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: #ef4444; margin-top: 20px; font-size: 14px;">This code will expire in 15 minutes.</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. 
            Your account remains secure.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2024 Symphony Institute of Technology. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json(
        { message: 'If an account with this email exists, a reset code has been sent.' },
        { status: 200 }
      );
    }

    // Generate OTP and expiry time (15 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Delete any existing unused tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    // Create new password reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: otp,
        expiresAt,
      },
    });

    // Send email with OTP
    await sendEmail(email, otp);

    return NextResponse.json(
      { message: 'Password reset code sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to send reset code' },
      { status: 500 }
    );
  }
}
