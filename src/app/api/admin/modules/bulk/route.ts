import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole } from '@/lib/auth';

interface BulkModuleData {
  courseId: string;
  modules: Array<{
    title: string;
    videoUrl?: string;
    homework?: string;
    description?: string;
    topics?: string[];
    isLocked?: boolean;
    order?: number;
  }>;
}

// POST - Bulk create modules
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const body: BulkModuleData = await request.json();
    const { courseId, modules: modulesData } = body;

    if (!courseId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course ID is required'
        },
        { status: 400 }
      );
    }

    if (!modulesData || !Array.isArray(modulesData) || modulesData.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Modules array is required and must not be empty'
        },
        { status: 400 }
      );
    }

    // Validate course exists
    const course = await (prisma as any).course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course not found'
        },
        { status: 404 }
      );
    }

    // Get the highest order for this course
    const lastModule = await (prisma as any).module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });

    let startingOrder = lastModule ? lastModule.order + 1 : 1;

    // Create modules in a transaction
    const createdModules = await (prisma as any).$transaction(
      modulesData.map((moduleData, index) => {
        return (prisma as any).module.create({
          data: {
            title: moduleData.title,
            videoUrl: moduleData.videoUrl || '',
            homework: moduleData.homework || '',
            description: moduleData.description || '',
            topics: moduleData.topics || [],
            order: moduleData.order !== undefined ? moduleData.order : startingOrder + index,
            courseId,
            isLocked: moduleData.isLocked !== undefined ? moduleData.isLocked : index > 0
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                category: true
              }
            }
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      modules: createdModules,
      message: `Successfully created ${createdModules.length} modules`
    });
  } catch (error) {
    console.error('Error bulk creating modules:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to bulk create modules'
      },
      { status: 500 }
    );
  }
}
