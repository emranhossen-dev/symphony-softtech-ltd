import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  return withErrorHandling(async (req) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const course = searchParams.get('course');

    let where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    // Fetch students with their enrolled courses and progress
    const students = await prisma.user.findMany({
      where: {
        ...where,
        role: { in: ['STUDENT', 'MENTOR'] }
      },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        moduleProgress: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to include enrolled courses with actual progress
    const transformedStudents = students.map(student => {
      // Calculate progress for each enrollment
      const enrolledCoursesWithProgress = student.enrollments.map(enrollment => {
        // Get all modules for this course
        const courseModules = student.moduleProgress.filter(mp => 
          mp.module.courseId === enrollment.courseId
        );
        
        // Calculate progress based on completed modules
        const totalModules = courseModules.length;
        const completedModules = courseModules.filter(mp => mp.completed).length;
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
        
        // Check if all modules are completed
        const isCompleted = totalModules > 0 && completedModules === totalModules;
        const completedAt = isCompleted && completedModules > 0 
          ? new Date(Math.max(...courseModules.filter(mp => mp.completed && mp.completedAt).map(mp => mp.completedAt!.getTime()))).toISOString()
          : null;
        
        return {
          id: enrollment.id,
          courseName: enrollment.course?.title || 'Unknown Course',
          category: enrollment.course?.category || 'UNKNOWN',
          enrollmentStatus: enrollment.enrollmentStatus,
          progress: progressPercentage,
          completedAt
        };
      });
      
      return {
        ...student,
        enrolledCourses: enrolledCoursesWithProgress
      };
    });

    return NextResponse.json({
      success: true,
      students: transformedStudents
    });
  }, request);
}
