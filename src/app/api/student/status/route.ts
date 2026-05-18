import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get student email from query params or session
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find enrollments for this student
    const enrollments = await prisma?.enrollment.findMany({
      where: {
        email,
        enrollmentStatus: {
          not: 'REJECTED'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1
    });

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        hasApprovedEnrollment: false,
        hasPassword: false,
        enrollmentStatus: null
      });
    }

    const latestEnrollment = enrollments[0];
    const isApproved = latestEnrollment.enrollmentStatus === 'ADMITTED';
    
    // Check if user exists in users table (has password)
    const user = await prisma?.user.findUnique({
      where: { email }
    });

    return NextResponse.json({
      hasApprovedEnrollment: isApproved,
      hasPassword: !!user,
      enrollmentStatus: latestEnrollment.enrollmentStatus,
      enrollmentId: latestEnrollment.id,
      courseName: latestEnrollment.courseName
    });

  } catch (error) {
    console.error('Error checking student status:', error);
    return NextResponse.json(
      { error: 'Failed to check student status' },
      { status: 500 }
    );
  }
}
