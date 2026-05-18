import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, type, scheduledAt, notes, nextFollowUp } = await request.json();

    if (!enrollmentId || !type || !scheduledAt) {
      return NextResponse.json(
        { error: 'Enrollment ID, type, and scheduled date are required' },
        { status: 400 }
      );
    }

    // Mock follow-up creation since FollowUp model doesn't exist
    const followUp = {
      id: `followup-${Date.now()}`,
      enrollmentId,
      type,
      scheduledAt: new Date(scheduledAt),
      notes,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      status: 'PENDING',
      createdAt: new Date(),
      enrollment: {
        fullName: 'Mock Student',
        email: 'student@example.com'
      }
    };

    return NextResponse.json({
      success: true,
      followUp
    });
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to schedule follow-up' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
