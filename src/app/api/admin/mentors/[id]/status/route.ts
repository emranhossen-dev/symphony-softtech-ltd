import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/error-handler';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async (req) => {
    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive field is required and must be boolean' },
        { status: 400 }
      );
    }

    // Update mentor status
    const updatedMentor = await prisma.user.update({
      where: { id },
      data: { isActive: body.isActive },
      include: {
        enrollments: {
          select: {
            id: true
          }
        },
        mentoredCourses: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      mentor: updatedMentor,
      message: `Mentor ${body.isActive ? 'activated' : 'deactivated'} successfully`
    });
  }, request);
}
