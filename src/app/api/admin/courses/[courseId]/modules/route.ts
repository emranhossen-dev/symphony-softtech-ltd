import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthError, verifyToken, hasRole, getAuthenticatedUser } from '@/lib/auth';



// GET /api/admin/courses/[courseId]/modules - Get all modules for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Try database first
    try {
      // Verify course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true }
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

      const modules = await prisma.module.findMany({
        where: { courseId },
        orderBy: { order: 'asc' }
      });

      return NextResponse.json({
        success: true,
        modules,
        course
      });
    } catch (dbError) {
      console.log('Database error, returning mock data:', dbError);
      
      // Return mock data for development
      const mockModules = [
        {
          id: 'module-1',
          courseId: courseId,
          title: '📚 Module 1: Bangla Language & Literature',
          videoUrl: 'https://www.youtube.com/watch?v=example1',
          homework: '**Bangla Language & Literature Assignment**\n\n**Topics Covered:**\n- Bangla Grammar Fundamentals\n- Literary Analysis\n- Creative Writing\n- Classical Literature\n\n**This Week\'s Tasks:**\n✅ Read Chapter 1-3 from the textbook\n✅ Complete grammar exercises (Pages 25-30)\n✅ Write a short composition on "Digital Bangladesh"\n✅ Join live discussion on Friday at 8 PM\n\n**Assignment:** Write a 500-word essay on the influence of Rabindranath Tagore in modern Bangla literature.\n\n**Due Date:** Next Sunday, 11:59 PM',
          order: 1,
          isLocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'module-2',
          courseId: courseId,
          title: '🧮 Module 2: Mathematics & Quantitative Aptitude',
          videoUrl: 'https://www.youtube.com/watch?v=example2',
          homework: '**Mathematics Assignment**\n\n**Topics Covered:**\n- Arithmetic and Algebra\n- Geometry and Mensuration\n- Statistics and Probability\n- Problem Solving Techniques\n\n**Practice Problems:**\n1. Solve 20 arithmetic problems (Page 45-50)\n2. Complete geometry exercises (Page 60-65)\n3. Statistics practice set (Page 70-72)\n\n**Mock Test:** This Saturday, 2:00 PM - 4:00 PM\n\n**Important:** Bring calculator and geometry box',
          order: 2,
          isLocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'module-3',
          courseId: courseId,
          title: '🌍 Module 3: General Knowledge & Current Affairs',
          videoUrl: 'https://www.youtube.com/watch?v=example3',
          homework: '**General Knowledge & Current Affairs**\n\n**This Week\'s Focus:**\n- International Relations\n- Recent Government Policies\n- Economic Developments\n- Science & Technology Updates\n\n**Daily Tasks:**\n- Read newspaper headlines\n- Watch news analysis videos\n- Update current affairs notebook\n- Practice quiz questions\n\n**Group Discussion:** Thursday, 7:30 PM',
          order: 3,
          isLocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        success: true,
        modules: mockModules,
        course: {
          id: courseId,
          title: 'BCS Preparation Complete Course'
        }
      });
    }
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch modules'
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses/[courseId]/modules - Create new module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  console.log('🔐 POST /api/admin/courses/[courseId]/modules - Endpoint called');
  
  try {
    const { courseId } = await params;
    console.log('🔐 POST - CourseId:', courseId);
    
    // Use cookie-based authentication
    console.log('🔐 POST - Attempting cookie-based authentication...');
    const payload = await getAuthenticatedUser();
    console.log('✅ POST - User authenticated via cookies:', payload.email, 'role:', payload.role);
    
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      console.error('❌ POST - Insufficient permissions for role:', payload.role);
      throw new AuthError('Insufficient permissions', 403);
    }
    
    console.log('✅ POST - User has sufficient permissions');

    const body = await request.json();
    const { title, videoUrl, homework } = body;

    if (!title) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Title is required'
        },
        { status: 400 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
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

    // Get the next order number
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const nextOrder = lastModule ? lastModule.order + 1 : 1;

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        videoUrl,
        homework,
        order: nextOrder,
        isLocked: true
      }
    });

    return NextResponse.json({
      success: true,
      module,
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

// PUT /api/admin/courses/[courseId]/modules - Update module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    
    // Use cookie-based authentication
    const payload = await getAuthenticatedUser();
    
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      console.error('❌ Insufficient permissions for role:', payload.role);
      throw new AuthError('Insufficient permissions', 403);
    }

    const { id, title, videoUrl, homework, order, isLocked } = await request.json();

    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Module ID is required'
        },
        { status: 400 }
      );
    }

    // Verify module exists and belongs to this course
    const existingModule = await prisma.module.findFirst({
      where: { 
        id,
        courseId 
      }
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

    const updatedModule = await prisma.module.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(videoUrl && { videoUrl }),
        ...(homework && { homework }),
        ...(order && { order }),
        ...(isLocked !== undefined && { isLocked })
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

// DELETE /api/admin/courses/[courseId]/modules - Delete module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    
    // Use cookie-based authentication
    const payload = await getAuthenticatedUser();
    
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      throw new AuthError('Insufficient permissions', 403);
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('id');

    if (!moduleId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Module ID is required'
        },
        { status: 400 }
      );
    }

    // Verify module exists and belongs to this course
    const existingModule = await prisma.module.findFirst({
      where: { 
        id: moduleId,
        courseId 
      }
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

    await prisma.module.delete({
      where: { id: moduleId }
    });

    // Reorder remaining modules
    const remainingModules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' }
    });

    // Update order numbers to be sequential
    await Promise.all(
      remainingModules.map(async (module: any, index: number) => {
        if (module.order !== index + 1) {
          await prisma.module.update({
            where: { id: module.id },
            data: { order: index + 1 }
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
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
