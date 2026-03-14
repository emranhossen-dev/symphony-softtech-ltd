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

    // Validate status - map to actual EnrollmentStatus enum
    const statusMap: Record<string, EnrollmentStatus> = {
      'APPLIED': 'PENDING_REVIEW',
      'WAITING': 'PAYMENT_PENDING',
      'ADMITTED': 'APPROVED',
      'NEXT_BATCH': 'PENDING_REVIEW', // Not in schema, map to pending
      'REJECTED': 'REJECTED'
    };

    const validStatuses = Object.keys(statusMap);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const mappedStatus = statusMap[status];

    // Update enrollment status
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { 
        enrollmentStatus: mappedStatus,
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
        action: `Enrollment status changed to ${mappedStatus}`,
        metadata: {
          previousStatus: enrollment.enrollmentStatus,
          newStatus: mappedStatus,
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
        status: mappedStatus,
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
