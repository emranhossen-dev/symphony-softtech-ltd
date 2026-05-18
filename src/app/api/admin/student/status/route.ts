import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    const { studentId, isActive } = await request.json();

    if (!studentId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Student ID and active status are required' },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student status:', error);
    return NextResponse.json(
      { error: 'Failed to update student status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
