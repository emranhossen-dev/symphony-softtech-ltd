import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    const { moduleId, progress, watchTime } = await request.json();

    if (!moduleId || progress === undefined) {
      return NextResponse.json(
        { error: 'Module ID and progress are required' },
        { status: 400 }
      );
    }

    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Update or create module progress
    const moduleProgress = await (prisma as any).moduleProgress.upsert({
      where: {
        moduleId_studentId: {
          moduleId,
          studentId
        }
      },
      update: {
        progress,
        watchTime: watchTime || 0,
        completed: progress >= 90,
        lastAccessed: new Date()
      },
      create: {
        moduleId,
        studentId,
        progress,
        watchTime: watchTime || 0,
        completed: progress >= 90,
        lastAccessed: new Date()
      }
    });

    // Calculate overall course progress
    const allProgress = await (prisma as any).moduleProgress.findMany({
      where: {
        studentId,
        module: {
          courseId: 'sample-course-id' // This would come from the module
        }
      }
    });

    const totalModules = allProgress.length;
    const completedModules = allProgress.filter((p: any) => p.studentId === studentId).length;
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    const totalTimeSpent = allProgress.reduce((sum: number, p: any) => sum + p.progress, 0);

    const courseProgress = {
      totalModules,
      completedModules,
      overallProgress,
      totalTimeSpent,
      lastAccessed: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      progress: courseProgress,
      moduleProgress
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
