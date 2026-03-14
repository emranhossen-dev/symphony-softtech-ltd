import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const { applicantId, employeeId, phoneNumber } = await request.json();

    // Validate required fields
    if (!applicantId || !employeeId || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: applicantId, employeeId, phoneNumber'
      }, { status: 400 });
    }

    // Get employee details
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: { name: true, email: true, phone: true }
    });

    if (!employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 });
    }

    // Create mock call log entry (TODO: Implement when CallRecord model exists)
    const callLog = {
      id: `call-${Date.now()}`,
      applicantId,
      employeeId,
      phoneNumber,
      callStatus: 'INITIATED',
      callDirection: 'OUTGOING',
      twilioCallSid: null,
      cost: 0.00,
      createdAt: new Date(),
      updatedAt: new Date(),
      applicant: { name: 'Mock Applicant' },
      employee: { name: employee.name }
    };

    // Mock Twilio call response (TODO: Implement actual Twilio integration)
    const twilioCall = {
      sid: `TWILIO-${Date.now()}`,
      status: 'queued'
    };

    // Mock update call log with Twilio SID (TODO: Implement actual database update)
    console.log('Would update call log with Twilio SID:', twilioCall.sid);

    return NextResponse.json({
      success: true,
      data: {
        callLogId: callLog.id,
        twilioCallSid: twilioCall.sid,
        callStatus: twilioCall.status,
        applicantName: callLog.applicant?.name,
        phoneNumber: phoneNumber
      }
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to initiate call',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
