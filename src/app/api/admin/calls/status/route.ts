import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const callDuration = formData.get('CallDuration') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;

    // Find the call log by Twilio SID
    const callLog = await prisma.callLog.findFirst({
      where: { twilioCallSid: callSid }
    });

    if (!callLog) {
      console.log('Call log not found for SID:', callSid);
      return NextResponse.json({ success: true });
    }

    // Update call log with status and duration
    const updateData: any = {
      callStatus: mapTwilioStatus(callStatus),
      updatedAt: new Date()
    };

    if (callDuration) {
      updateData.callDuration = parseInt(callDuration);
    }

    if (recordingUrl) {
      updateData.recordingUrl = recordingUrl;
    }

    // Calculate call cost (example: $0.01 per minute)
    if (callDuration) {
      const minutes = parseInt(callDuration) / 60;
      updateData.cost = minutes * 0.01;
    }

    await prisma.callLog.update({
      where: { id: callLog.id },
      data: updateData
    });

    console.log(`Call ${callSid} updated with status: ${callStatus}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating call status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update call status' 
    }, { status: 500 });
  }
}

function mapTwilioStatus(twilioStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'queued': 'INITIATED',
    'ringing': 'IN_PROGRESS',
    'in-progress': 'IN_PROGRESS',
    'completed': 'COMPLETED',
    'failed': 'FAILED',
    'busy': 'FAILED',
    'no-answer': 'MISSED'
  };

  return statusMap[twilioStatus] || 'FAILED';
}
