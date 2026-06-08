import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Mentor access required' }, { status: 403 });
    }

    const courseSlug = slug;

    // Get all mentor courses
    const mentorCourses = await (prisma as any).course.findMany({
      where: { mentorId: user.id },
      select: { id: true, title: true }
    });

    // Find matching course by slug
    const matchedCourse = mentorCourses.find((c: any) => createSlug(c.title) === courseSlug);

    // Fallback: try by ID
    let course = null;
    if (matchedCourse) {
      course = await (prisma as any).course.findFirst({
        where: { id: matchedCourse.id, mentorId: user.id },
        include: {
          enrollments: true,
          modules: { orderBy: { order: 'asc' } },
          _count: { select: { enrollments: true, modules: true } }
        }
      });
    } else {
      course = await (prisma as any).course.findFirst({
        where: { id: courseSlug, mentorId: user.id },
        include: {
          enrollments: true,
          modules: { orderBy: { order: 'asc' } },
          _count: { select: { enrollments: true, modules: true } }
        }
      });
    }

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    const formattedEnrollments = course.enrollments.map((e: any) => ({
      ...e,
      fullName: e.fullName || e.studentName || 'Unknown',
      email: e.email || 'unknown@example.com',
      homeworkSubmitted: e.homeworkSubmitted || 0
    }));

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
        enrollments: formattedEnrollments
      }
    });

  } catch (error: any) {
    console.error('API ERROR:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
