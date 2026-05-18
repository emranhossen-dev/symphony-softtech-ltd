import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    // Get user from auth token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from token
    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    // Fetch all enrollments (both approved and pending)
    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        userId: user.id
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true,
            thumbnail: true,
            duration: true,
            price: true
          }
        },
        payments: {
          select: {
            paymentStatus: true,
            paymentMethod: true,
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match expected format
    const transformedCourses = enrollments.map((enrollment: any) => {
      // For approved courses, show progress and course details
      if (enrollment.enrollmentStatus === 'APPROVED') {
        // Mock progress data for approved courses
        const completedLessons = Math.floor(Math.random() * 5); // Mock data
        const totalLessons = 10; // Mock data
        const percentage = Math.round((completedLessons / totalLessons) * 100);
        const timeSpent = Math.floor(Math.random() * 50) + 10; // Random between 10-60 hours
        
        return {
          id: enrollment.id,
          courseName: enrollment.course.title,
          category: enrollment.course.category || 'General',
          instructor: 'Assigned Mentor',
          thumbnail: enrollment.course.thumbnail,
          description: enrollment.course.description,
          enrolledAt: enrollment.createdAt.toISOString(),
          enrollmentStatus: enrollment.enrollmentStatus,
          progress: {
            completedLessons,
            totalLessons,
            percentage,
            lastAccessed: enrollment.updatedAt.toISOString(),
            timeSpent
          },
          upcomingClasses: [], // Mock empty for now
          materials: [] // Mock empty for now
        };
      } else {
        // For pending courses, show minimal info with status
        return {
          id: enrollment.id,
          courseName: enrollment.course.title,
          category: enrollment.course.category || 'General',
          instructor: 'Pending Assignment',
          thumbnail: enrollment.course.thumbnail,
          description: enrollment.course.description,
          enrolledAt: enrollment.createdAt.toISOString(),
          enrollmentStatus: enrollment.enrollmentStatus,
          progress: {
            completedLessons: 0,
            totalLessons: 0,
            percentage: 0,
            lastAccessed: enrollment.createdAt.toISOString(),
            timeSpent: 0
          },
          upcomingClasses: [],
          materials: []
        };
      }
    });

    return NextResponse.json({
      success: true,
      courses: transformedCourses
    });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
