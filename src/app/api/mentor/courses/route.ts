import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the mentor ID from the session/auth token
    const mentorId = 'current-mentor-id'; // This would come from auth

    // Fetch mentor's assigned courses
    const courses = await (prisma as any).course.findMany({
      where: {
        mentorId,
        isActive: true
      },
      include: {
        enrollments: {
          where: {
            enrollmentStatus: 'APPROVED'
          }
        },
        _count: {
          select: {
            enrollments: {
              where: {
                enrollmentStatus: 'APPROVED'
              }
            }
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
      name: course.name,
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
