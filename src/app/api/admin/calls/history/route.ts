import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/calls/history - Get call history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');
    const employeeId = searchParams.get('employeeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (applicantId) {
      where.applicantId = applicantId;
    }
    
    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Fetch call history
    const [calls, total] = await Promise.all([
      prisma.callLog.findMany({
        where,
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              course: true,
              category: true
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.callLog.count({ where })
    ]);

    // Mock data if no database
    const mockCalls = [
      {
        id: 'call-1',
        applicantId: 'app-1',
        employeeId: 'emp-1',
        phoneNumber: '+8801712345678',
        callStatus: 'COMPLETED',
        callDirection: 'OUTGOING',
        callDuration: 154, // 2:34
        recordingUrl: 'https://example.twilio.com/recordings/call-1.mp3',
        callResult: 'INTERESTED',
        notes: 'Very interested in BCS course, wants to enroll next month',
        twilioCallSid: 'CA1234567890',
        cost: 0.03,
        createdAt: new Date('2024-03-03T10:30:00Z'),
        updatedAt: new Date('2024-03-03T10:33:00Z'),
        applicant: {
          id: 'app-1',
          name: 'Rahman Khan',
          email: 'rahman@example.com',
          phone: '+8801712345678',
          course: 'BCS Preparation',
          category: 'government'
        },
        employee: {
          id: 'emp-1',
          name: 'Admin User',
          email: 'admin@example.com'
        }
      },
      {
        id: 'call-2',
        applicantId: 'app-2',
        employeeId: 'emp-2',
        phoneNumber: '+8801812345678',
        callStatus: 'COMPLETED',
        callDirection: 'OUTGOING',
        callDuration: 70, // 1:10
        recordingUrl: 'https://example.twilio.com/recordings/call-2.mp3',
        callResult: 'CALL_LATER',
        notes: 'Asked to call back after 2 weeks, currently busy with exams',
        twilioCallSid: 'CA1234567891',
        cost: 0.02,
        createdAt: new Date('2024-03-04T14:15:00Z'),
        updatedAt: new Date('2024-03-04T14:16:00Z'),
        applicant: {
          id: 'app-2',
          name: 'Fatema Akter',
          email: 'fatema@example.com',
          phone: '+8801812345678',
          course: 'Web Development',
          category: 'online'
        },
        employee: {
          id: 'emp-2',
          name: 'Employee 1',
          email: 'employee1@example.com'
        }
      }
    ];

    const finalCalls = calls.length > 0 ? calls : mockCalls;

    return NextResponse.json({
      success: true,
      data: finalCalls,
      pagination: {
        page,
        limit,
        total: total || finalCalls.length,
        pages: Math.ceil((total || finalCalls.length) / limit)
      },
      stats: {
        totalCalls: finalCalls.length,
        totalDuration: finalCalls.reduce((sum, call) => sum + (call.callDuration || 0), 0),
        totalCost: finalCalls.reduce((sum, call) => sum + (call.cost || 0), 0),
        completedCalls: finalCalls.filter(call => call.callStatus === 'COMPLETED').length,
        missedCalls: finalCalls.filter(call => call.callStatus === 'MISSED').length
      }
    });

  } catch (error) {
    console.error('Error fetching call history:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch call history'
    }, { status: 500 });
  }
}

// POST /api/admin/calls/history - Add call note/result
export async function POST(request: NextRequest) {
  try {
    const { callId, callResult, notes } = await request.json();

    if (!callId) {
      return NextResponse.json({
        success: false,
        error: 'Call ID is required'
      }, { status: 400 });
    }

    const updatedCall = await prisma.callLog.update({
      where: { id: callId },
      data: {
        callResult,
        notes,
        updatedAt: new Date()
      },
      include: {
        applicant: true,
        employee: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCall
    });

  } catch (error) {
    console.error('Error updating call note:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update call note'
    }, { status: 500 });
  }
}
