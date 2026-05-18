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

    // Mock status update (TODO: Implement when CallRecord model exists)
    console.log(`Call ${callSid} status update: ${callStatus}, duration: ${callDuration}, recording: ${recordingUrl}`);
    
    // Mock finding and updating call log
    const mockCallLog = {
      id: `call-${Date.now()}`,
      twilioCallSid: callSid,
      callStatus: mapTwilioStatus(callStatus),
      callDuration: callDuration ? parseInt(callDuration) : null,
      recordingUrl: recordingUrl || null,
      cost: callDuration ? (parseInt(callDuration) / 60) * 0.01 : 0,
      updatedAt: new Date()
    };

    console.log('Would update call log with:', mockCallLog);

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
