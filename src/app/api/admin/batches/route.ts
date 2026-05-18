import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    // For development: Skip authentication check temporarily
    // TODO: Enable authentication in production

    // Return mock batches data for now
    const mockBatches = [
      {
        id: 'batch-1',
        name: 'Batch 1 - Government Course',
        courseName: 'Government Preparation Course',
        isActive: true,
        currentStudents: 25,
        maxStudents: 30,
        schedule: 'Mon-Wed-Fri 6PM-8PM'
      },
      {
        id: 'batch-2',
        name: 'Batch 2 - Online Course',
        courseName: 'Online Marketing Course',
        isActive: true,
        currentStudents: 15,
        maxStudents: 20,
        schedule: 'Tue-Thu 7PM-9PM'
      },
      {
        id: 'batch-3',
        name: 'Batch 3 - Offline Course',
        courseName: 'Offline Development Course',
        isActive: false,
        currentStudents: 10,
        maxStudents: 25,
        schedule: 'Sat-Sun 10AM-1PM'
      }
    ];

    return NextResponse.json({
      success: true,
      batches: mockBatches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // For development: Skip authentication check temporarily
    // TODO: Enable authentication in production
    
    const body = await request.json();
    const { name, courseId, mentorId, maxStudents, schedule } = body;

    // Validate required fields
    if (!name || !courseId || !maxStudents || !schedule) {
      return NextResponse.json(
        { success: false, error: 'Name, course, max students, and schedule are required' },
        { status: 400 }
      );
    }

    // For now, return mock response
    const newBatch = {
      id: `batch-${Date.now()}`,
      name,
      courseId,
      mentorId,
      maxStudents,
      currentStudents: 0,
      schedule,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Batch created successfully',
      batch: newBatch
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}
