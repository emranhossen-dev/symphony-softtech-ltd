import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;
    const body = await request.json();
    const { status } = body;

    console.log('PATCH /api/admin/enrollments/[enrollmentId]/status');
    console.log('Enrollment ID:', enrollmentId);
    console.log('New status:', status);

    // Check if database is available
    if (!prisma) {
      console.log('Database not available, returning mock response');
      return NextResponse.json({
        success: true,
        message: 'Status updated successfully (mock)'
      });
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        id: enrollmentId
      },
      data: {
        enrollmentStatus: status,
        updatedAt: new Date()
      }
    });

    console.log('Updated enrollment:', updatedEnrollment);

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      enrollment: updatedEnrollment
    });

  } catch (error) {
    console.error('Error updating enrollment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
