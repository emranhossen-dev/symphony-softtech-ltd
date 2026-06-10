import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole, getAuthenticatedUser } from '@/lib/auth';

// POST /api/admin/courses/[courseId]/modules/bulk - Bulk operations on modules
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    let payload;

    try {
      payload = await getAuthenticatedUser();
    } catch (cookieAuthError) {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');

      if (!token) {
        throw cookieAuthError;
      }

      payload = verifyToken(token);
    }

    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const body = await request.json();
    const { action, moduleIds, modules: modulesToCreate } = body;

    // Handle bulk module creation
    if (action === 'create' && modulesToCreate && Array.isArray(modulesToCreate)) {
      // Validate modules data
      const validModules = modulesToCreate.filter(module => 
        module.title && module.title.trim()
      );

      if (validModules.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'At least one valid module with title is required'
          },
          { status: 400 }
        );
      }

      // Get current max order for this course
      const maxOrderModule = await prisma?.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' }
      });

      const startOrder = maxOrderModule ? maxOrderModule.order + 1 : 1;

      // Create modules
      const createdModules = await Promise.all(
        validModules.map((module, index) => 
          prisma?.module.create({
            data: {
              title: module.title.trim(),
              videoUrl: module.videoUrl || '',
              homework: module.homework || '',
              isLocked: module.isLocked !== undefined ? module.isLocked : false,
              order: startOrder + index,
              courseId
            }
          })
        )
      );

      return NextResponse.json({
        success: true,
        message: `Created ${createdModules.length} modules successfully`,
        modules: createdModules
      });
    }

    if (!action || !moduleIds || !Array.isArray(moduleIds)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Action and moduleIds are required'
        },
        { status: 400 }
      );
    }

    // Verify all modules belong to this course
    const modules = await prisma?.module.findMany({
      where: { 
        id: { in: moduleIds },
        courseId 
      }
    });

    if (!modules || modules.length !== moduleIds.length) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Some modules not found or do not belong to this course'
        },
        { status: 404 }
      );
    }

    let result;
    switch (action) {
      case 'lock':
        result = await prisma?.module.updateMany({
          where: { id: { in: moduleIds } },
          data: { isLocked: true }
        });
        break;
      
      case 'unlock':
        result = await prisma?.module.updateMany({
          where: { id: { in: moduleIds } },
          data: { isLocked: false }
        });
        break;
      
      case 'delete':
        // Delete modules and reorder remaining
        await prisma?.module.deleteMany({
          where: { id: { in: moduleIds } }
        });
        
        // Reorder remaining modules
        const remainingModuleItems = await prisma?.module.findMany({
          where: { courseId },
          orderBy: { order: 'asc' }
        });

        if (remainingModuleItems) {
          await Promise.all(
            remainingModuleItems.map(async (moduleItem: any, index: number) => {
              if (moduleItem.order !== index + 1) {
                await prisma?.module.update({
                  where: { id: moduleItem.id },
                  data: { order: index + 1 }
                });
              }
            })
          );
        }
        result = { count: moduleIds.length };
        break;
      
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action. Supported actions: create, lock, unlock, delete'
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Modules ${action}ed successfully`,
      affected: result?.count || moduleIds.length
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    
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
        error: 'Failed to perform bulk operation'
      },
      { status: 500 }
    );
  }
}
