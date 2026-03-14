import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const enrollmentData = await request.json();
    
    // Store temporary enrollment data (mock since TempEnrollment model doesn't exist)
    const tempEnrollment = {
      id: `temp-${Date.now()}`,
      tempId: enrollmentData.temp_id,
      fullName: enrollmentData.fullName,
      phoneNumber: enrollmentData.phoneNumber,
      email: enrollmentData.email,
      address: enrollmentData.address,
      educationLevel: enrollmentData.educationLevel || '',
      whyJoin: enrollmentData.whyJoin || '',
      preferredBatchTime: enrollmentData.preferredBatchTime || '',
      paymentMethod: enrollmentData.paymentMethod,
      amount: enrollmentData.amount,
      courseName: enrollmentData.courseName,
      category: enrollmentData.category,
      courseId: enrollmentData.courseId,
      tranId: enrollmentData.tran_id,
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Would store temp enrollment:', tempEnrollment);

    return NextResponse.json({
      success: true,
      tempId: tempEnrollment.id,
    });

  } catch (error) {
    console.error('Temp enrollment store error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to store enrollment data'
    }, { status: 500 });
  }
}
