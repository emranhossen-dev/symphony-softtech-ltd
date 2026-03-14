import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Fetch student's enrolled courses for stats calculation
    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        enrollmentStatus: 'APPROVED'
      },
      include: {
        lessons: {
          include: {
            lesson: {
              select: {
                duration: true
              }
            }
          }
        },
        upcomingClasses: {
          where: {
            scheduledAt: {
              gte: new Date()
            }
          }
        }
      }
    });

    // Calculate stats
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e: any) => {
      const completedLessons = e.lessons.filter((l: any) => l.completed).length;
      const totalLessons = e.lessons.length;
      return totalLessons > 0 && completedLessons === totalLessons;
    }).length;

    // Calculate total learning hours (sum of completed lesson durations)
    const totalHours = enrollments.reduce((sum: number, enrollment: any) => {
      const completedLessons = enrollment.lessons.filter((l: any) => l.completed);
      return sum + completedLessons.reduce((lessonSum: number, l: any) => lessonSum + (l.lesson?.duration || 0), 0);
    }, 0);

    // Calculate average progress
    const averageProgress = enrollments.length > 0 
      ? Math.round(
          enrollments.reduce((sum: number, enrollment: any) => {
            const completedLessons = enrollment.lessons.filter((l: any) => l.completed).length;
            const totalLessons = enrollment.lessons.length;
            const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
            return sum + progress;
          }, 0) / enrollments.length
        )
      : 0;

    // Count upcoming classes
    const upcomingClasses = enrollments.reduce((sum: number, enrollment: any) => sum + enrollment.upcomingClasses.length, 0);

    // Fetch unread notifications count
    const unreadNotifications = await (prisma as any).notification.count({
      where: {
        studentId,
        read: false
      }
    });

    const stats = {
      totalCourses,
      completedCourses,
      totalHours: Math.round(totalHours / 60), // Convert minutes to hours
      averageProgress,
      upcomingClasses,
      unreadNotifications
    };

    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
