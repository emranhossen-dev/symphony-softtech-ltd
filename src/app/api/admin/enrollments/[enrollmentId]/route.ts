import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;

    // Check if database is available
    if (!prisma) {
      // Return mock data if database is not available
      const mockEnrollment = {
        id: enrollmentId,
        fullName: 'Rahman Mia',
        phoneNumber: '01712345678',
        email: 'rahman@example.com',
        address: 'Dhaka, Bangladesh',
        courseName: 'BCS Preparation',
        educationLevel: 'Graduate',
        whyJoin: 'Want to join civil service',
        preferredBatchTime: 'Morning',
        enrollmentStatus: 'PENDING_REVIEW',
        paymentStatus: 'NOT_REQUIRED',
        assignedMentor: 'Dr. Karim',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        payments: [
          {
            id: '1',
            paymentMethod: 'bkash',
            transactionId: 'TXN123456',
            amount: 5000,
            paymentStatus: 'PAID',
            createdAt: new Date().toISOString()
          }
        ]
      };

      return NextResponse.json({
        success: true,
        enrollment: mockEnrollment
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: enrollmentId
      },
      include: {
        payments: true,
        course: {
          include: {
            mentor: {
              select: {
                name: true
              }
            }
          }
        },
        category: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Transform the data to match expected format
    const transformedEnrollment = {
      id: enrollment.id,
      fullName: enrollment.fullName,
      phoneNumber: enrollment.phoneNumber,
      email: enrollment.email,
      address: enrollment.address,
      courseName: enrollment.courseName,
      educationLevel: enrollment.educationLevel,
      whyJoin: enrollment.whyJoin,
      preferredBatchTime: enrollment.preferredBatchTime,
      enrollmentStatus: enrollment.enrollmentStatus,
      paymentStatus: enrollment.payments && enrollment.payments.length > 0 
        ? enrollment.payments[0].paymentStatus 
        : 'NOT_REQUIRED',
      assignedMentor: enrollment.course?.mentor?.name,
      createdAt: enrollment.createdAt.toISOString(),
      updatedAt: enrollment.updatedAt.toISOString(),
      payments: enrollment.payments.map(payment => ({
        id: payment.id,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentStatus: payment.paymentStatus,
        createdAt: payment.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      enrollment: transformedEnrollment
    });

  } catch (error) {
    console.error('Error fetching enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrollment' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;
    const body = await request.json();

    // Check if database is available
    if (!prisma) {
      return NextResponse.json({
        success: true,
        enrollment: {
          id: enrollmentId,
          ...body,
          updatedAt: new Date().toISOString()
        }
      });
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        id: enrollmentId
      },
      data: {
        enrollmentStatus: body.status,
        updatedAt: new Date()
      },
      include: {
        payments: true,
        course: {
          include: {
            mentor: {
              select: {
                name: true
              }
            }
          }
        },
        category: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Handle payment status update
    if (body.paymentStatus && body.paymentStatus !== 'NOT_REQUIRED') {
      // Check if payment record exists
      const existingPayment = await prisma.payment.findFirst({
        where: { enrollmentId }
      });

      if (existingPayment) {
        // Update existing payment
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { paymentStatus: body.paymentStatus }
        });
      } else {
        // Create new payment record
        await prisma.payment.create({
          data: {
            enrollmentId,
            paymentStatus: body.paymentStatus,
            transactionId: `MANUAL_${Date.now()}`,
            amount: 5000, // Default amount
            paymentMethod: 'manual'
          }
        });
      }
    }

    // Transform the data to match expected format
    const transformedEnrollment = {
      id: updatedEnrollment.id,
      fullName: updatedEnrollment.fullName,
      phoneNumber: updatedEnrollment.phoneNumber,
      email: updatedEnrollment.email,
      address: updatedEnrollment.address,
      courseName: updatedEnrollment.courseName,
      educationLevel: updatedEnrollment.educationLevel,
      whyJoin: updatedEnrollment.whyJoin,
      preferredBatchTime: updatedEnrollment.preferredBatchTime,
      enrollmentStatus: updatedEnrollment.enrollmentStatus,
      paymentStatus: updatedEnrollment.payments && updatedEnrollment.payments.length > 0 
        ? updatedEnrollment.payments[0].paymentStatus 
        : 'NOT_REQUIRED',
      assignedMentor: updatedEnrollment.course?.mentor?.name,
      createdAt: updatedEnrollment.createdAt.toISOString(),
      updatedAt: updatedEnrollment.updatedAt.toISOString(),
      payments: updatedEnrollment.payments.map(payment => ({
        id: payment.id,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentStatus: payment.paymentStatus,
        createdAt: payment.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      enrollment: transformedEnrollment
    });

  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;

    // Check if database is available
    if (!prisma) {
      // For mock data, just return success
      return NextResponse.json({
        success: true,
        message: 'Enrollment deleted successfully (mock)'
      });
    }

    // First check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!existingEnrollment) {
      // If enrollment not found in database, it might be a mock ID
      // Return success for mock data consistency
      if (enrollmentId.startsWith('enroll-')) {
        return NextResponse.json({
          success: true,
          message: 'Enrollment deleted successfully (mock)'
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id: enrollmentId }
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}
