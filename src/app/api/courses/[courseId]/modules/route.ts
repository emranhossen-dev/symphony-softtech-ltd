import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET /api/courses/[courseId]/modules - Get modules for students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Check if course exists and is active
    const course = await prisma.course.findUnique({
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

    if (!course.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course is not available'
        },
        { status: 403 }
      );
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({
      success: true,
      modules
    });
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
