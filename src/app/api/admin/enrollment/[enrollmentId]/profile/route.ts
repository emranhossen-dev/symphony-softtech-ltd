import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;

    // Check if database is available
    if (!prisma) {
      // Return mock data if database is not available
      const mockProfile = {
        id: enrollmentId,
        fullName: 'Rahman Mia',
        phoneNumber: '01712345678',
        email: 'rahman@example.com',
        address: 'Dhaka, Bangladesh',
        educationLevel: 'Graduate',
        whyJoin: 'Want to join civil service',
        preferredBatchTime: 'Morning',
        enrollmentStatus: 'APPLIED',
        paymentStatus: 'PENDING',
        courseName: 'BCS Preparation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        profile: mockProfile
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: enrollmentId
      },
      include: {
        course: {
          include: {
            categoryRelation: true
          }
        },
        user: true,
        category: true
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const profile = {
      id: enrollment.id,
      fullName: enrollment.fullName || enrollment.user?.name,
      phoneNumber: enrollment.phoneNumber || enrollment.user?.phone,
      email: enrollment.email || enrollment.user?.email,
      address: enrollment.address,
      educationLevel: enrollment.educationLevel,
      whyJoin: enrollment.whyJoin,
      preferredBatchTime: enrollment.preferredBatchTime,
      enrollmentStatus: enrollment.enrollmentStatus,
      paymentStatus: enrollment.paymentStatus || 'PENDING',
      courseName: enrollment.courseName || enrollment.course?.title,
      categoryName: enrollment.course?.categoryRelation?.name || enrollment.category?.name,
      createdAt: enrollment.createdAt.toISOString(),
      updatedAt: enrollment.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching enrollment profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
