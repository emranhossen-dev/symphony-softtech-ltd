import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    const { enrollmentId, status } = await request.json();

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { error: 'Enrollment ID and status are required' },
        { status: 400 }
      );
    }

    // Update enrollment status
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { enrollmentStatus: status as any }
    });

    // Add mock data for missing relations
    const enrollmentWithMocks = {
      ...updatedEnrollment,
      followUps: [],
      callHistory: []
    };

    return NextResponse.json({
      success: true,
      enrollment: enrollmentWithMocks
    });
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    return NextResponse.json(
      { error: 'Failed to update enrollment status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
