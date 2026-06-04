import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Check which admitted students have user accounts
    const admittedWithEmails = admittedEnrollments?.map(e => e.email) || [];
    const studentEmails = studentUsers?.map(u => u.email) || [];
    
    const admittedWithoutAccounts = admittedWithEmails.filter(email => !studentEmails.includes(email));
    const admittedWithAccounts = admittedWithEmails.filter(email => studentEmails.includes(email));

    return NextResponse.json({
      success: true,
      data: {
        admittedEnrollments: admittedEnrollments?.length || 0,
        studentUsers: studentUsers?.length || 0,
        admittedWithoutAccounts: admittedWithoutAccounts.length,
        admittedWithAccounts: admittedWithAccounts.length,
        details: {
          admittedEnrollments: admittedEnrollments?.map(e => ({
            email: e.email,
            name: e.fullName,
            course: e.course?.title,
            hasUserAccount: studentEmails.includes(e.email)
          })),
          studentUsers: studentUsers,
          admittedWithoutAccounts: admittedWithoutAccounts
        }
      }
    });

  } catch (error) {
    console.error('Debug auth status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get auth status' },
      { status: 500 }
    );
  }
}
