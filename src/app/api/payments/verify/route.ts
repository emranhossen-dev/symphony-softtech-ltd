import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandling,
  NotFoundError,
  ValidationError 
} from '@/lib/error-handler';
import { logActivity, ActivityType, extractRequestInfo } from '@/lib/activity-logger';
import { createStudentUser, generateToken } from '@/lib/auth';



async function verifyPaymentHandler(request: NextRequest): Promise<NextResponse> {
  const requestInfo = extractRequestInfo(request);
  const body = await request.json();
  
  try {
    const { paymentId, action, notes } = body;

    if (!paymentId || !action) {
      throw new ValidationError('Payment ID and action are required');
    }

    // Find payment with enrollment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        enrollment: {
          include: {
            user: true
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.paymentStatus !== 'PENDING') {
      throw new ValidationError('Payment has already been processed');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: action === 'approve' ? 'PAID' : 'FAILED',
        updatedAt: new Date()
      }
    });

    // Update enrollment status based on payment action
    const enrollmentStatus = action === 'approve' ? 'APPROVED' : 'PAYMENT_PENDING';
    
    await prisma.enrollment.update({
      where: { id: payment.enrollmentId },
      data: {
        enrollmentStatus,
        updatedAt: new Date()
      }
    });

    // If payment is approved, create user account and unlock first module
    if (action === 'approve') {
      const enrollment = payment.enrollment;
      
      // Create student user if not exists
      const { user, tempPassword } = await createStudentUser({
        fullName: enrollment.fullName,
        email: enrollment.email,
        phoneNumber: enrollment.phoneNumber
      });

      // Link user to enrollment
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { userId: user.id }
      });

      // Get course for module assignment
      const course = await prisma.course.findFirst({
        where: {
          OR: [
            { title: { contains: enrollment.courseName, mode: 'insensitive' } },
            { slug: enrollment.courseName }
          ]
        }
      });

      // Create module progress for first module if course exists
      if (course) {
        const firstModule = await prisma.module.findFirst({
          where: { courseId: course.id },
          orderBy: { order: 'asc' }
        });

        if (firstModule) {
          await prisma.moduleProgress.create({
            data: {
              userId: user.id,
              moduleId: firstModule.id,
              courseId: course.id,
              completed: false
            }
          });
        }

        // Update course assignment
        await prisma.user.update({
          where: { id: user.id },
          data: {
            // Additional user data can be added here
          }
        });
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ENROLLMENT_APPROVED',
          title: 'Enrollment Approved',
          message: `Your enrollment for ${enrollment.courseName} has been approved! You can now access your course.`,
          metadata: {
            enrollmentId: enrollment.id,
            courseName: enrollment.courseName,
            tempPassword
          }
        }
      });

      // Log successful enrollment approval
      await logActivity({
        userId: user.id,
        type: ActivityType.ENROLLMENT_APPROVED,
        action: `Enrollment approved for ${enrollment.fullName} - ${enrollment.courseName}`,
        metadata: {
          paymentId,
          enrollmentId: enrollment.id,
          courseName: enrollment.courseName,
          userId: user.id,
          tempPassword: tempPassword ? 'generated' : 'existing'
        },
        ...requestInfo
      });
    } else {
      // Log payment rejection
      await logActivity({
        type: ActivityType.PAYMENT_VERIFIED,
        action: `Payment rejected for ${payment.enrollment.fullName}`,
        metadata: {
          paymentId,
          enrollmentId: payment.enrollmentId,
          reason: notes || 'Payment verification failed',
          status: 'REJECTED'
        },
        ...requestInfo
      });
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      payment: updatedPayment,
      enrollmentStatus
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}

async function getPaymentsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.paymentStatus = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          enrollment: {
            select: {
              id: true,
              fullName: true,
              email: true,
              courseName: true,
              category: true,
              enrollmentStatus: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    throw error;
  }
}

// Export handlers with error wrapping
export const POST = (request: NextRequest) => withErrorHandling(verifyPaymentHandler, request);
export const GET = (request: NextRequest) => withErrorHandling(getPaymentsHandler, request);
