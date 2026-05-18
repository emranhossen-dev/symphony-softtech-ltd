import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/calls/history - Get call history
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement call history when CallRecord model is properly integrated
    const mockCalls = [
      {
        id: 'call-1',
        applicantId: 'app-1',
        employeeId: 'emp-1',
        phoneNumber: '+8801712345678',
        callStatus: 'COMPLETED',
        callDirection: 'OUTGOING',
        callDuration: 45, // 0:45
        recordingUrl: 'https://example.twilio.com/recordings/call-1.mp3',
        callResult: 'INTERESTED',
        notes: 'Interested in BCS preparation course, asked for fee structure',
        twilioCallSid: 'CA1234567890',
        cost: 0.015,
        createdAt: new Date('2024-03-04T10:30:00Z'),
        updatedAt: new Date('2024-03-04T10:31:00Z'),
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const total = mockCalls.length;

    return NextResponse.json({
      success: true,
      data: mockCalls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        totalCalls: mockCalls.length,
        totalDuration: mockCalls.reduce((sum, call) => sum + (call.callDuration || 0), 0),
        totalCost: mockCalls.reduce((sum, call) => sum + (call.cost || 0), 0),
        completedCalls: mockCalls.filter(call => call.callStatus === 'COMPLETED').length,
        missedCalls: mockCalls.filter(call => call.callStatus === 'MISSED').length
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

