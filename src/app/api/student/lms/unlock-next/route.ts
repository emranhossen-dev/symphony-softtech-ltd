import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    const { moduleId } = await request.json();

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Find the next module
    const currentModule = await (prisma as any).module.findUnique({
      where: { id: moduleId },
      include: {
        course: true
      }
    });

    if (!currentModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    const nextModule = await (prisma as any).module.findFirst({
      where: {
        courseId: currentModule.courseId,
        order: {
          gt: currentModule.order
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    if (!nextModule) {
      return NextResponse.json(
        { error: 'No next module found' },
        { status: 404 }
      );
    }

    // Unlock the next module by creating a progress entry
    await (prisma as any).moduleProgress.upsert({
      where: {
        moduleId_studentId: {
          moduleId: nextModule.id,
          studentId
        }
      },
      update: {
        isUnlocked: true
      },
      create: {
        moduleId: nextModule.id,
        studentId,
        progress: 0,
        watchTime: 0,
        completed: false,
        isUnlocked: true,
        lastAccessed: new Date()
      }
    });

    // Fetch updated modules list
    const modules = await (prisma as any).module.findMany({
      where: {
        courseId: currentModule.courseId,
        isActive: true
      },
      include: {
        content: true,
        resources: true,
        progress: {
          where: {
            studentId
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Transform modules to include lock status and progress
    const transformedModules = modules.map((module: any, index: any) => {
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

    return NextResponse.json({
      success: true,
      modules: transformedModules,
      unlockedModuleId: nextModule.id
    });
  } catch (error) {
    console.error('Error unlocking next module:', error);
    return NextResponse.json(
      { error: 'Failed to unlock next module' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
