import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/enrollments - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      courseId,
      name,
      email,
      phone,
      address,
      dateOfBirth, // This field is not in database schema, will be ignored
      education,
      paymentMethod,
      agreeTerms
    } = body;

    // Validate required fields
    if (!courseId || !name || !email || !phone) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: courseId, name, email, phone are required'
        },
        { status: 400 }
      );
    }

    // Check if course exists and get category info
    const course = await prisma?.course.findUnique({
      where: { id: courseId, isActive: true },
      include: {
        categoryRelation: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course not found or not available'
        },
        { status: 404 }
      );
    }

    // If course doesn't have categoryId but has category string, try to find the category
    let categoryId = course.categoryId;
    if (!categoryId && course.category) {
      const category = await prisma?.category.findFirst({
        where: {
          OR: [
            { slug: course.category.toLowerCase() },
            { name: { equals: course.category, mode: 'insensitive' } }
          ]
        }
      });
      if (category) {
        categoryId = category.id;
      }
    }

    // Check if already enrolled
    const existingEnrollment = await prisma?.enrollment.findFirst({
      where: {
        email,
        courseId,
        enrollmentStatus: {
          not: 'REJECTED'
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { 
          success: false,
          error: 'You are already enrolled in this course'
        },
        { status: 400 }
      );
    }

    // Determine enrollment status based on payment method and course category
    const categorySlug = course.categoryRelation?.slug?.toLowerCase() || '';
    let enrollmentStatus: 'PENDING_REVIEW' | 'PAYMENT_PENDING' | 'APPROVED' | 'REJECTED' = 'PAYMENT_PENDING';

    // Government courses - free enrollment
    if (categorySlug === 'government' || categorySlug.includes('government')) {
      enrollmentStatus = 'PENDING_REVIEW';
    }
    // Cash and online payment - pending payment
    else if (paymentMethod === 'cash' || paymentMethod === 'online') {
      enrollmentStatus = 'PAYMENT_PENDING';
    }

    // Create enrollment
    const enrollment = await prisma?.enrollment.create({
      data: {
        fullName: name,
        email,
        phoneNumber: phone,
        address,
        courseId,
        courseName: course.title,
        categoryId: categoryId,
        enrollmentStatus,
        // Additional fields
        educationLevel: education,
      }
    });

    // Create payment record if payment is required
    if (paymentMethod && paymentMethod !== 'none') {
      await prisma?.payment.create({
        data: {
          enrollmentId: enrollment.id,
          paymentMethod,
          amount: course.price || 0,
          paymentStatus: paymentMethod === 'online' ? 'PENDING' : 'PENDING'
        }
      });
    }

    // If online payment, initiate SSLCommerz
    if (paymentMethod === 'online') {
      try {
        const sslcommerzResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/sslcommerz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            amount: course.price || 0,
            courseName: course.title,
            customerInfo: {
              name,
              email,
              phone,
              address
            }
          })
        });

        const sslcommerzData = await sslcommerzResponse.json();

        if (sslcommerzData.success) {
          return NextResponse.json({
            success: true,
            message: 'Enrollment created! Redirecting to payment...',
            enrollment: {
              id: enrollment.id,
              fullName: enrollment.fullName,
              email: enrollment.email,
              courseName: enrollment.courseName,
              status: enrollment.enrollmentStatus,
              createdAt: enrollment.createdAt
            },
            paymentUrl: sslcommerzData.paymentUrl,
            transactionId: sslcommerzData.transactionId
          });
        } else {
          // SSLCommerz failed, but enrollment was created
          return NextResponse.json({
            success: true,
            message: 'Enrollment created but payment initialization failed. Please contact support.',
            enrollment: {
              id: enrollment.id,
              fullName: enrollment.fullName,
              email: enrollment.email,
              courseName: enrollment.courseName,
              status: enrollment.enrollmentStatus,
              paymentStatus: 'FAILED',
              createdAt: enrollment.createdAt
            }
          });
        }
      } catch (sslError) {
        console.error('SSLCommerz initialization error:', sslError);
        return NextResponse.json({
          success: true,
          message: 'Enrollment created but payment initialization failed. Please try payment again.',
          enrollment: {
            id: enrollment.id,
            fullName: enrollment.fullName,
            email: enrollment.email,
            courseName: enrollment.courseName,
            status: enrollment.enrollmentStatus,
            paymentStatus: 'FAILED',
            createdAt: enrollment.createdAt
          }
        });
      }
    }

    // For non-online payments, return enrollment success
    return NextResponse.json({
      success: true,
      message: enrollmentStatus === 'PENDING_REVIEW' 
        ? 'Enrollment submitted successfully! Your enrollment is now under review.'
        : enrollmentStatus === 'PAYMENT_PENDING'
        ? 'Enrollment submitted successfully! Please visit our center to complete payment.'
        : 'Enrollment submitted successfully!',
      enrollment: {
        id: enrollment.id,
        fullName: enrollment.fullName,
        email: enrollment.email,
        courseName: enrollment.courseName,
        status: enrollment.enrollmentStatus,
        createdAt: enrollment.createdAt
      }
    });

  } catch (error) {
    console.error('Enrollment error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      body: request.body
    });
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to enroll in course. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/enrollments - Get all enrollments (admin only)
export async function GET(request: NextRequest) {
  try {
    const enrollments = await prisma?.enrollment.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      enrollments
    });

  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch enrollments'
      },
      { status: 500 }
    );
  }
}
