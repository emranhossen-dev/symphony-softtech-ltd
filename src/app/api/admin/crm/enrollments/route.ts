import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // Fetch enrollments
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match expected format
    const transformedEnrollments = enrollments.map((enrollment: any) => {
      return {
        id: enrollment.id,
        fullName: enrollment.fullName,
        email: enrollment.email,
        phoneNumber: enrollment.phoneNumber,
        courseName: enrollment.courseName,
        category: enrollment.category,
        enrollmentStatus: enrollment.enrollmentStatus,
        createdAt: enrollment.createdAt.toISOString(),
        // Add empty arrays for missing relations
        followUps: [],
        callHistory: [],
        assignedEmployee: null
      };
    });

    return NextResponse.json({
      success: true,
      enrollments: transformedEnrollments
    });
  } catch (error) {
    console.error('Error fetching CRM enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
