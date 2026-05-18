import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EnrollmentStatus } from '@prisma/client';



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    // Validate status - use new enum values directly
    const validStatuses = ['APPLIED', 'ADMITTED', 'REJECTED', 'WAITING', 'NEXT_BATCH'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update enrollment status
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { 
        enrollmentStatus: status as any,
        updatedAt: new Date()
      },
      include: {
        course: {
          select: {
            title: true,
            category: true
          }
        }
      }
    });

    // Log the status change
    await prisma.activityLog.create({
      data: {
        type: 'STATUS_CHANGE',
        action: `Enrollment status changed to ${status}`,
        metadata: {
          previousStatus: enrollment.enrollmentStatus,
          newStatus: status,
          enrollmentId: id,
          courseName: enrollment.course?.title,
          category: enrollment.course?.category
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Enrollment status updated to ${status}`,
      enrollment: {
        id: enrollment.id,
        fullName: enrollment.fullName,
        status: status,
        course: enrollment.course
      }
    });

  } catch (error) {
    console.error('Error updating enrollment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enrollment status' },
      { status: 500 }
    );
  }
}
