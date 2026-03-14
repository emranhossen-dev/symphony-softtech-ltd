import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole } from '@/lib/auth';

// POST /api/admin/courses/[courseId]/modules/bulk - Bulk operations on modules
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const { action, moduleIds } = await request.json();

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
        const remainingModules = await prisma?.module.findMany({
          where: { courseId },
          orderBy: { order: 'asc' }
        });

        if (remainingModules) {
          await Promise.all(
            remainingModules.map(async (module: any, index: number) => {
              if (module.order !== index + 1) {
                await prisma?.module.update({
                  where: { id: module.id },
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
            error: 'Invalid action. Supported actions: lock, unlock, delete'
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
