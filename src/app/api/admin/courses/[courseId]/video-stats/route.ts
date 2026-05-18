import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole } from '@/lib/auth';

// GET /api/admin/courses/[courseId]/video-stats - Get video statistics for course
export async function GET(
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

    // Get modules for this course
    const modules = await prisma?.module.findMany({
      where: { courseId },
      select: { id: true }
    });

    if (!modules) {
      return NextResponse.json({
        success: true,
        stats: {}
      });
    }

    // Generate mock stats for each module
    const stats: Record<string, any> = {};
    modules.forEach(module => {
      stats[module.id] = {
        totalViews: Math.floor(Math.random() * 500) + 50,
        averageWatchTime: Math.floor(Math.random() * 20) + 5,
        completionRate: Math.floor(Math.random() * 40) + 60,
        engagement: Math.floor(Math.random() * 30) + 70
      };
    });

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching video stats:', error);
    
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
        error: 'Failed to fetch video statistics'
      },
      { status: 500 }
    );
  }
}
