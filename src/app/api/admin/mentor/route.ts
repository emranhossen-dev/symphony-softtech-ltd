import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';



export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, phoneNumber, expertise, experience, bio } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if mentor with email already exists
    const existingMentor = await (prisma as any).user.findUnique({
      where: { email }
    });

    if (existingMentor) {
      return NextResponse.json(
        { error: 'Mentor with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new mentor
    const mentor = await (prisma as any).user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        phone: phoneNumber,
        role: 'MENTOR',
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      mentor
    });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to create mentor' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
