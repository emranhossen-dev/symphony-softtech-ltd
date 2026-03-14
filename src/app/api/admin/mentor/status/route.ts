import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    const { mentorId, isActive } = await request.json();

    if (!mentorId) {
      return NextResponse.json(
        { error: 'Mentor ID is required' },
        { status: 400 }
      );
    }

    // Update mentor status
    const updatedMentor = await (prisma as any).user.update({
      where: { id: mentorId },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      mentor: updatedMentor
    });
  } catch (error) {
    console.error('Error updating mentor status:', error);
    return NextResponse.json(
      { error: 'Failed to update mentor status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
