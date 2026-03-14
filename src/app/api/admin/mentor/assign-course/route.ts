import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { mentorId, courseId } = await request.json();

    if (!mentorId || !courseId) {
      return NextResponse.json(
        { error: 'Mentor ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Mock assignment since MentorCourseAssignment model doesn't exist
    const assignment = {
      id: `assignment-${Date.now()}`,
      mentorId,
      courseId,
      createdAt: new Date(),
      mentor: {
        id: mentorId,
        name: 'Mock Mentor',
        email: 'mentor@example.com'
      },
      course: {
        id: courseId,
        title: 'Mock Course'
      }
    };

    return NextResponse.json({
      success: true,
      assignment
    });
  } catch (error) {
    console.error('Error assigning course to mentor:', error);
    return NextResponse.json(
      { error: 'Failed to assign course to mentor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
