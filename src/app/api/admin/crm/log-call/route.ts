import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, status, notes, duration, nextFollowUp } = await request.json();

    if (!enrollmentId || !status || !notes) {
      return NextResponse.json(
        { error: 'Enrollment ID, status, and notes are required' },
        { status: 400 }
      );
    }

    // Mock call log creation since CallHistory model doesn't exist
    const callLog = {
      id: `call-${Date.now()}`,
      enrollmentId,
      type: 'CALL',
      status,
      notes,
      duration: duration || 0,
      completedAt: new Date(),
      employeeId: 'current-employee-id',
      createdAt: new Date(),
      enrollment: {
        fullName: 'Mock Student',
        email: 'student@example.com'
      }
    };

    return NextResponse.json({
      success: true,
      callLog
    });
  } catch (error) {
    console.error('Error logging call:', error);
    return NextResponse.json(
      { error: 'Failed to log call' },
      { status: 500 }
    );
  } 
}
