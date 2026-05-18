import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { tran_id } = await request.json();

    if (!tran_id) {
      return NextResponse.json({
        success: false,
        error: 'Transaction ID is required'
      }, { status: 400 });
    }

    // Find enrollment by transaction ID
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        payments: {
          some: {
            transactionId: tran_id,
            paymentMethod: 'FREE_REGISTRATION'
          }
        }
      },
      include: {
        payments: true,
        course: true
      }
    });

    if (!enrollment) {
      return NextResponse.json({
        success: false,
        error: 'Enrollment not found'
      }, { status: 404 });
    }

    // Check if enrollment is admitted
    if (enrollment.enrollmentStatus !== 'ADMITTED') {
      return NextResponse.json({
        success: false,
        error: 'Enrollment not admitted yet'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        fullName: enrollment.fullName,
        email: enrollment.email,
        phoneNumber: enrollment.phoneNumber,
        courseName: enrollment.courseName,
        whyJoin: enrollment.whyJoin,
        enrollmentStatus: enrollment.enrollmentStatus,
        createdAt: enrollment.createdAt
      }
    });

  } catch (error) {
    console.error('Government enrollment verification error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to verify government enrollment',
      details: errorMessage
    }, { status: 500 });
  }
}
