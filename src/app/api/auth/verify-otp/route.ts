import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json(
      { message: 'Code verified successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
