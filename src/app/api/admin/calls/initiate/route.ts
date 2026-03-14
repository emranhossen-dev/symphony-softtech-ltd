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

    // Create call log entry
    const callLog = await prisma.callLog.create({
      data: {
        applicantId,
        employeeId,
        phoneNumber,
        callStatus: 'INITIATED',
        callDirection: 'OUTGOING',
        twilioCallSid: null, // Will be updated after Twilio call
        cost: 0.00
      },
      include: {
        applicant: true,
        employee: true
      }
    });

    // Initiate Twilio call
    const twilioCall = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/calls/handle?callLogId=${callLog.id}`,
      to: phoneNumber,
      from: twilioPhoneNumber,
      record: true, // Enable recording
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/calls/status`,
      statusCallbackMethod: 'POST'
    });

    // Update call log with Twilio SID
    await prisma.callLog.update({
      where: { id: callLog.id },
      data: {
        twilioCallSid: twilioCall.sid,
        callStatus: 'IN_PROGRESS'
      }
    });

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
