import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get mentor ID from auth token
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

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json(
        { error: 'Mentor access required' },
        { status: 403 }
      );
    }

    // Fetch mentor's assigned courses
    const courses = await (prisma as any).course.findMany({
      where: {
        mentorId: user.id,
        isActive: true
      },
      include: {
        enrollments: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    // Transform data to match expected format
    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.title,
      category: course.category,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      isActive: course.isActive,
      enrolledStudents: course._count.enrollments,
      averageRating: 4.5, // Mock data - would calculate from reviews
      completionRate: Math.floor(Math.random() * 30) + 60, // Mock data
      mentorId: course.mentorId
    }));

    return NextResponse.json({
      success: true,
      courses: transformedCourses
    });
  } catch (error) {
    console.error('Error fetching mentor courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
