import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const { id, registrationId } = await params;
    const body = await request.json();
    
    const updateData: any = {};
    
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    
    if (body.callStatus !== undefined) {
      updateData.callStatus = body.callStatus;
    }
    
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    
    if (body.hasWhatsApp !== undefined) {
      updateData.hasWhatsApp = body.hasWhatsApp;
    }

    const registration = await prisma.seminarRegistration.update({
      where: {
        id: registrationId,
        seminarId: id
      },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update registration'
    }, { status: 500 });
  }
}
