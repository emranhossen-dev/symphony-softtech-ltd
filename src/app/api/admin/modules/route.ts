import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole } from '@/lib/auth';



// GET all modules from all courses
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const courseId = searchParams.get('courseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (courseId && courseId !== 'all') {
      where.courseId = courseId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { course: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const modules = await (prisma as any).module.findMany({
      where,
      skip,
      take: limit,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: [
        { courseId: 'asc' },
        { order: 'asc' }
      ]
    });

    const totalCount = await (prisma as any).module.count({ where });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      modules,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    
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
        error: 'Failed to fetch modules'
      },
      { status: 500 }
    );
  }
}

// POST - Create new module
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

    const { title, videoUrl, homework, courseId, isLocked } = await request.json();

    if (!title || !courseId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Title and Course ID are required'
        },
        { status: 400 }
      );
    }

    // Get the highest order for this course
    const lastModule = await (prisma as any).module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    const newModule = await (prisma as any).module.create({
      data: {
        title,
        videoUrl,
        homework: homework || '',
        order: newOrder,
        courseId,
        isLocked: isLocked ?? false,
        isActive: true
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

    return NextResponse.json({
      success: true,
      module: newModule,
      message: 'Module created successfully'
    });
  } catch (error) {
    console.error('Error creating module:', error);
    
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
        error: 'Failed to create module'
      },
      { status: 500 }
    );
  }
}

// PUT - Update module
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const { id, title, videoUrl, homework, isLocked, order } = await request.json();

    if (!id) {
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
      where: { id }
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
      where: { id },
      data: {
        ...(title && { title }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(homework !== undefined && { homework }),
        ...(isLocked !== undefined && { isLocked }),
        ...(order !== undefined && { order })
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

    return NextResponse.json({
      success: true,
      module: updatedModule,
      message: 'Module updated successfully'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    
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
        error: 'Failed to update module'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete module
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new AuthError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const { moduleId } = await request.json();

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

    const deletedModule = await (prisma as any).module.delete({
      where: { id: moduleId }
    });

    return NextResponse.json({
      success: true,
      module: deletedModule,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    
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
        error: 'Failed to delete module'
      },
      { status: 500 }
    );
  }
}
