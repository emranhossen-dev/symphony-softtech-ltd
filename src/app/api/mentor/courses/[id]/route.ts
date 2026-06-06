import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const courseId = params.id;

    // Fetch course with all details
    const course = await (prisma as any).course.findUnique({
      where: {
        id: courseId,
        mentorId: user.id
      },
      include: {
        enrollments: true,
        modules: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        name: course.title,
        title: course.title,
        category: course.category,
        description: course.description,
        enrolledStudents: course._count.enrollments,
        isActive: course.isActive,
        modules: course.modules,
        enrollments: course.enrollments
      }
    });

  } catch (error: any) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
