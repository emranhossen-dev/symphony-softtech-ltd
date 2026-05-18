import { NextRequest, NextResponse } from 'next/server';
import { withEmployeeRoute } from '@/lib/middleware';

// Employee-only routes for enrollment management
export async function GET(request: NextRequest) {
  try {
    const user = (request as any).user;
    
    // This would typically fetch enrollments from database
    const enrollments = [
      {
        id: '1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        courseName: 'Web Development Fundamentals',
        category: 'Web Development',
        educationLevel: 'Beginner',
        whyJoin: 'Interested in learning web development',
        preferredBatchTime: 'Weekend',
        enrollmentStatus: 'APPROVED',
        paymentStatus: 'COMPLETED',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phoneNumber: '+1234567891',
        courseName: 'Advanced JavaScript',
        category: 'Web Development',
        educationLevel: 'Intermediate',
        whyJoin: 'Want to advance JavaScript skills',
        preferredBatchTime: 'Evening',
        enrollmentStatus: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      enrollments
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, enrollmentStatus, paymentStatus } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    // This would typically update enrollment in database
    const updatedEnrollment = {
      id,
      enrollmentStatus,
      paymentStatus,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      enrollment: updatedEnrollment,
      message: 'Enrollment updated successfully'
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to update enrollment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    // This would typically delete enrollment from database
    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    );
  }
}
