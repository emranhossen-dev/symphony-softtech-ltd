import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;
    const body = await request.json();
    const { status } = body;

    // Check if database is available
    if (!prisma) {
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
