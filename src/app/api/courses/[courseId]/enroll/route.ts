import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, getUserFromToken } from '@/lib/auth';



// POST /api/courses/[courseId]/enroll - Enroll in course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Get authentication token from header or cookie
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    // For development: Use mock user if no token
    let user;
    if (!token) {
      user = {
        id: 'cmmbhmtas0003bu5mokeb5d8h', // John Mentor user ID from database
        email: 'mentor@example.com',
        name: 'John Mentor',
        role: 'MENTOR',
        phone: '+8801234567890'
      };
    } else {
      try {
        user = await getUserFromToken(token);
      } catch (error) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid authentication token'
          },
          { status: 401 }
        );
      }
    }

    // Check if course exists and is active
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error'
        },
        { status: 500 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course not found'
        },
        { status: 404 }
      );
    }

    if (!course.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course is not available for enrollment'
        },
        { status: 403 }
      );
    }

    // Check if already enrolled
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error'
        },
        { status: 500 }
      );
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Already enrolled in this course'
        },
        { status: 400 }
      );
    }

    // Create enrollment
    if (!prisma) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection error'
        },
        { status: 500 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        fullName: user.name,
        phoneNumber: user.phone || '',
        email: user.email,
        address: '', // TODO: Add address field to user profile
        courseId: courseId,
        courseName: course.title,
        categoryId: course.categoryId || course.category,
        userId: user.id,
        enrollmentStatus: 'PENDING_REVIEW'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to enroll in course. Please try again.'
      },
      { status: 500 }
    );
  }
}
