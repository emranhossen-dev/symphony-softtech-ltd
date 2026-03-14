import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function PATCH(request: NextRequest) {
  try {
    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Mark all notifications as read for this student
    const result = await (prisma as any).notification.updateMany({
      where: {
        studentId,
        read: false
      },
      data: {
        read: true
      }
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
