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

    // Fetch students enrolled in mentor's courses
    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        enrollmentStatus: 'ADMITTED',
        course: {
          mentorId: user.id
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            slug: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        }
      }
    });

    // Group students by user and calculate their progress
    const studentsMap = new Map();

    enrollments.forEach((enrollment: any) => {
      const userId = enrollment.userId;
      const studentName = enrollment.user.name || 'Unknown Student';

      if (!studentsMap.has(userId)) {
        studentsMap.set(userId, {
          id: userId,
          firstName: studentName.split(' ')[0],
          lastName: studentName.split(' ').slice(1).join(' '),
          email: enrollment.user.email,
          phoneNumber: '',
          enrolledCourses: [{
            id: enrollment.course.id,
            name: enrollment.course.title,
            category: enrollment.course.category,
            progress: 0,
            enrolledAt: enrollment.createdAt.toISOString()
          }],
          totalProgress: 0,
          averageRating: 0,
          isActive: enrollment.user.isActive
        });
      }

      const student = studentsMap.get(userId);
      student.enrolledCourses.push({
        id: enrollment.course.id,
        name: enrollment.course.title,
        category: enrollment.course.category,
        progress: 0,
        lastActive: new Date().toISOString()
      });

      student.totalProgress = Math.floor(
        student.enrolledCourses.reduce((sum: number, course: any) => sum + course.progress, 0) / student.enrolledCourses.length
      );
    });

    const students = Array.from(studentsMap.values());

    return NextResponse.json({
      success: true,
      students
    });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
