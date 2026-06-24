import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, handleApiError, successResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const courses = await (prisma as any).course.findMany({
      where: {
        mentorId: auth.user.id,
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

    const transformedCourses = courses.map((course: any) => ({
      id: course.id,
      name: course.title,
      category: course.category,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      isActive: course.isActive,
      enrolledStudents: course._count.enrollments,
      averageRating: 4.5,
      completionRate: Math.floor(Math.random() * 30) + 60,
      mentorId: course.mentorId
    }));

    return successResponse({ courses: transformedCourses });
  } catch (error) {
    return handleApiError(error, 'fetch courses');
  }
}
