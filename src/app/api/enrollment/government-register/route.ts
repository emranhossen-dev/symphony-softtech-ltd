import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStudentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const enrollmentData = await request.json();
    console.log('Received enrollment data:', enrollmentData);
    
    // Create government course enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        fullName: enrollmentData.fullName,
        phoneNumber: enrollmentData.phoneNumber,
        email: enrollmentData.email,
        address: enrollmentData.address,
        educationLevel: enrollmentData.educationLevel || '',
        whyJoin: enrollmentData.whyJoin || '',
        preferredBatchTime: enrollmentData.preferredBatchTime || '',
        courseName: enrollmentData.courseName,
        courseId: enrollmentData.courseId,
        categoryId: enrollmentData.categoryId || null,
        enrollmentStatus: 'ADMITTED',
      },
    });

    // Create payment record for government course (free)
    const payment = await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        paymentMethod: 'FREE_REGISTRATION',
        transactionId: enrollmentData.tran_id,
        amount: 0,
        paymentStatus: 'NOT_REQUIRED',
      },
    });

    // Create student user account for government course
    const { user, tempPassword } = await createStudentUser({
      fullName: enrollmentData.fullName,
      email: enrollmentData.email,
      phoneNumber: enrollmentData.phoneNumber,
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
          { title: { contains: enrollmentData.courseName, mode: 'insensitive' } },
          { slug: enrollmentData.courseName }
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
    }

    // Create notification for the student
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'ENROLLMENT_APPROVED',
        title: 'Government Course Registration Successful',
        message: `Your registration for ${enrollmentData.courseName} has been approved! You can now access your course.`,
        metadata: {
          enrollmentId: enrollment.id,
          courseName: enrollmentData.courseName,
          tempPassword: tempPassword || 'existing_account'
        },
        isRead: false,
      },
    });

    // Create notification for admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    if (adminUsers.length > 0) {
      await prisma.notification.create({
        data: {
          userId: adminUsers[0].id, // Send to first admin user
          type: 'ENROLLMENT_APPROVED',
          title: 'New Government Course Registration',
          message: `${enrollmentData.fullName} has registered for ${enrollmentData.courseName}`,
          metadata: {
            enrollmentId: enrollment.id,
            studentName: enrollmentData.fullName,
            courseName: enrollmentData.courseName,
            email: enrollmentData.email,
            phone: enrollmentData.phoneNumber,
            subject: enrollmentData.whyJoin,
          },
          isRead: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        fullName: enrollment.fullName,
        email: enrollment.email,
        phoneNumber: enrollment.phoneNumber,
        courseName: enrollment.courseName,
        enrollmentStatus: enrollment.enrollmentStatus,
        createdAt: enrollment.createdAt,
        payment: {
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentStatus: payment.paymentStatus,
        },
        userAccount: {
          created: true,
          email: user.email,
          tempPassword: tempPassword
        }
      },
    });

  } catch (error) {
    console.error('Government enrollment error:', error);
    
    let errorMessage = 'Unknown error occurred';
    let errorStack = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('Error details:', errorMessage);
    console.error('Error stack:', errorStack);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to register for government course',
      details: errorMessage
    }, { status: 500 });
  }
}
