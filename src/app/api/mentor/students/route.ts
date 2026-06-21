import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, handleApiError, successResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ['MENTOR']);
    if (!auth.success) return auth.response;

    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        enrollmentStatus: 'ADMITTED',
        course: {
          mentorId: auth.user.id
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

    return successResponse({ students });
  } catch (error) {
    return handleApiError(error, 'fetch students');
  }
}
