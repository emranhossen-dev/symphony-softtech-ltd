import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';



export async function POST(request: NextRequest) {
  try {
    const { studentId, newPassword } = await request.json();

    if (!studentId || !newPassword) {
      return NextResponse.json(
        { error: 'Student ID and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
