import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// PUT /api/admin/courses/[courseId]/modules/reorder - Reorder modules
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();
    const { modules } = body;

    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid modules data'
        },
        { status: 400 }
      );
    }

    // Update each module's order
    const updatePromises = modules.map((module: { id: string; order: number }) =>
      prisma.module.update({
        where: { id: module.id },
        data: { order: module.order }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Module order updated successfully'
    });
  } catch (error) {
    console.error('Error reordering modules:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update module order'
      },
      { status: 500 }
    );
  }
}
