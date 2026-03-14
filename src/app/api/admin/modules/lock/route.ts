import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole } from '@/lib/auth';



// PATCH - Toggle module lock status
export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const { moduleId, isLocked } = await request.json();

    if (!moduleId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Module ID is required'
        },
        { status: 400 }
      );
    }

    // Verify module exists
    const existingModule = await (prisma as any).module.findUnique({
      where: { id: moduleId }
    });

    if (!existingModule) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Module not found'
        },
        { status: 404 }
      );
    }

    const updatedModule = await (prisma as any).module.update({
      where: { id: moduleId },
      data: { isLocked }
    });

    return NextResponse.json({
      success: true,
      module: updatedModule,
      message: `Module ${isLocked ? 'locked' : 'unlocked'} successfully`
    });
  } catch (error) {
    console.error('Error updating module lock status:', error);
    
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
        error: 'Failed to update module lock status'
      },
      { status: 500 }
    );
  }
}
