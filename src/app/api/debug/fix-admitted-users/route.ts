import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStudentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get all admitted enrollments
    const admittedEnrollments = await prisma?.enrollment.findMany({
      where: { enrollmentStatus: 'ADMITTED' },
      include: {
        course: { select: { title: true } }
      }
    });

    // Get all student users
    const studentUsers = await prisma?.user.findMany({
      where: { role: 'STUDENT' },
      select: { email: true }
    });

    const studentEmails = studentUsers?.map(u => u.email) || [];
    
    // Find admitted students without user accounts
    const admittedWithoutAccounts = admittedEnrollments?.filter(
      enrollment => !studentEmails.includes(enrollment.email)
    ) || [];

    console.log(`Found ${admittedWithoutAccounts.length} admitted students without user accounts`);

    const results = [];

    // Create user accounts for each admitted student
    for (const enrollment of admittedWithoutAccounts) {
      try {
        const userResult = await createStudentUser({
          fullName: enrollment.fullName,
          email: enrollment.email,
          phoneNumber: enrollment.phoneNumber || ''
        });

        results.push({
          email: enrollment.email,
          name: enrollment.fullName,
          course: enrollment.course?.title,
          success: true,
          tempPassword: userResult.tempPassword,
          message: 'User account created successfully'
        });

        console.log(`Created user account for: ${enrollment.email}`);
      } catch (error) {
        results.push({
          email: enrollment.email,
          name: enrollment.fullName,
          course: enrollment.course?.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to create user account'
        });

        console.error(`Failed to create user account for ${enrollment.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${admittedWithoutAccounts.length} admitted students`,
      results: results
    });

  } catch (error) {
    console.error('Fix admitted users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix admitted users' },
      { status: 500 }
    );
  }
}
