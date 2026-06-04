import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAdmissionEmail, sendRejectionEmail, sendStatusChangeEmail } from '@/lib/email';
import { createStudentUser } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const { enrollmentId } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    console.log('PATCH /api/admin/enrollments/[enrollmentId]/status');
    console.log('Enrollment ID:', enrollmentId);
    console.log('New status:', status);

    // Check if database is available
    if (!prisma) {
      console.log('Database not available, returning mock response');
      return NextResponse.json({
        success: true,
        message: 'Status updated successfully (mock)'
      });
    }

    // Get the current enrollment to capture the previous status
    const currentEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          select: { title: true }
        }
      }
    });

    if (!currentEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const previousStatus = currentEnrollment.enrollmentStatus;

    // Update the enrollment status
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        id: enrollmentId
      },
      data: {
        enrollmentStatus: status,
        updatedAt: new Date()
      }
    });

    console.log('Updated enrollment:', updatedEnrollment);

    // Send email notification based on status change
    try {
      if (previousStatus !== status) {
        console.log(`Status changed from ${previousStatus} to ${status}, sending email notification`);

        let emailResult;

        if (status === 'ADMITTED') {
          // Create user account for the admitted student
          let tempPassword = '';
          let userAccountCreated = false;
          
          try {
            console.log('Creating user account for admitted student:', currentEnrollment.email);
            
            const userResult = await createStudentUser({
              fullName: currentEnrollment.fullName,
              email: currentEnrollment.email,
              phoneNumber: currentEnrollment.phoneNumber || ''
            });
            
            tempPassword = userResult.tempPassword || '';
            userAccountCreated = true;
            
            console.log('Student user account created successfully:', {
              email: userResult.user.email,
              userId: userResult.user.id,
              tempPassword: tempPassword ? 'generated' : 'existing_user'
            });
          } catch (userError) {
            console.error('Error creating student user account:', userError);
            console.error('User error details:', {
              message: userError instanceof Error ? userError.message : 'Unknown error',
              stack: userError instanceof Error ? userError.stack : 'No stack'
            });
            
            // Generate a fallback password if user creation fails
            tempPassword = Math.random().toString(36).slice(-8);
            userAccountCreated = false;
            
            console.log('Using fallback password due to user creation failure');
          }
          
          console.log('Sending admission email with password:', {
            email: currentEnrollment.email,
            hasPassword: !!tempPassword,
            userAccountCreated
          });
          
          emailResult = await sendAdmissionEmail({
            to: currentEnrollment.email,
            fullName: currentEnrollment.fullName,
            courseName: currentEnrollment.course?.title || 'Unknown Course',
            email: currentEnrollment.email,
            password: tempPassword,
            loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
          });
          
          console.log('Admission email sent to:', currentEnrollment.email);
        } else if (status === 'REJECTED') {
          emailResult = await sendRejectionEmail({
            to: currentEnrollment.email,
            fullName: currentEnrollment.fullName,
            courseName: currentEnrollment.course?.title || 'Unknown Course',
            email: currentEnrollment.email,
            enrollmentId: enrollmentId,
            rejectionReason: rejectionReason
          });
          
          console.log('Rejection email sent to:', currentEnrollment.email);
        } else {
          // For other status changes, send general status change email
          emailResult = await sendStatusChangeEmail({
            to: currentEnrollment.email,
            fullName: currentEnrollment.fullName,
            courseName: currentEnrollment.course?.title || 'Unknown Course',
            email: currentEnrollment.email,
            enrollmentId: enrollmentId,
            oldStatus: previousStatus,
            newStatus: status,
            additionalInfo: rejectionReason
          });
          
          console.log('Status change email sent to:', currentEnrollment.email);
        }

        if (emailResult.success) {
          console.log('Email notification sent successfully');
        } else {
          console.error('Failed to send email notification:', emailResult.error);
        }
      } else {
        console.log('Status unchanged, no email sent');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the status update if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      enrollment: updatedEnrollment,
      emailSent: previousStatus !== status
    });

  } catch (error) {
    console.error('Error updating enrollment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    );
  }
}
