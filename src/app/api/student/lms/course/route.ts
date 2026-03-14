import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth
    const courseId = 'sample-course-id'; // This would come from URL params or context

    // Fetch course modules with progress
    const modules = await (prisma as any).module.findMany({
      where: {
        courseId: courseId
      },
      include: {
        content: true,
        resources: true,
        progress: {
          where: {
            studentId: studentId
          }
        },
        _count: {
          select: {
            progress: {
              where: {
                studentId: studentId,
                completed: true
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Transform modules to include lock status and progress
    const transformedModules = modules.map((module: any, index: number) => {
      const studentProgress = module.progress[0];
      const progress = studentProgress?.progress || 0;
      const isCompleted = progress >= 90;
      
      // Lock logic: module is locked if previous module is not completed
      const isLocked = index > 0 && !modules[index - 1].progress.some((p: any) => 
        p.studentId === studentId && p.progress >= 90
      );

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        type: module.type,
        duration: module.duration,
        order: module.order,
        isLocked,
        isCompleted,
        progress,
        content: module.content ? {
          videoUrl: module.content.videoUrl,
          pdfUrl: module.content.pdfUrl,
          quizQuestions: module.content.quizQuestions,
          assignmentDetails: module.content.assignmentDetails
        } : undefined,
        resources: module.resources.map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          type: resource.type,
          url: resource.url,
          downloadable: resource.downloadable
        }))
      };
    });

    // Calculate overall progress
    const totalModules = transformedModules.length;
    const completedModules = transformedModules.filter((m: any) => m.isCompleted).length;
    const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    // Calculate total time spent (mock data for now)
    const totalTimeSpent = Math.floor(Math.random() * 300) + 60; // Random between 1-6 hours

    const courseProgress = {
      totalModules,
      completedModules,
      overallProgress,
      totalTimeSpent,
      lastAccessed: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      modules: transformedModules,
      progress: courseProgress
    });
  } catch (error) {
    console.error('Error fetching course data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
