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

    if (!enrollmentId || enrollmentId === 'undefined') {
      return NextResponse.json(
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['APPLIED', 'ADMITTED', 'REJECTED', 'WAITING', 'NEXT_BATCH'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

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

    // Prepare update data
    const updateData: any = {
      enrollmentStatus: status,
      updatedAt: new Date()
    };

    let linkedUserId: string | null = null;

    // Update the enrollment status
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        id: enrollmentId
      },
      data: updateData
    });

    console.log('Updated enrollment:', updatedEnrollment);

    // Send email notification based on status change
    try {
      if (previousStatus !== status) {
        console.log(`Status changed from ${previousStatus} to ${status}, sending email notification`);

        let emailResult: { success: boolean; error?: string } | undefined;

        if (status === 'ADMITTED') {
          // Step 1: Always create or update user account first
          let tempPassword = '';
          try {
            console.log('[ADMISSION] Creating/updating user for:', currentEnrollment.email);
            
            const userResult = await createStudentUser({
              fullName: currentEnrollment.fullName,
              email: currentEnrollment.email,
              phoneNumber: currentEnrollment.phoneNumber || ''
            });
            
            linkedUserId = userResult.user.id;
            tempPassword = userResult.tempPassword || '';
            
            console.log('[ADMISSION] User ready:', {
              userId: userResult.user.id,
              email: userResult.user.email,
              isNew: !!userResult.tempPassword,
              hasPassword: !!tempPassword
            });
          } catch (userError) {
            console.error('[ADMISSION] CRITICAL: Failed to create user:', userError);
            // Don't proceed with email if user creation fails
          }
          
          // Step 2: Link user to enrollment (critical for dashboard access)
          if (linkedUserId) {
            try {
              await prisma.enrollment.update({
                where: { id: enrollmentId },
                data: { userId: linkedUserId }
              });
              console.log('[ADMISSION] Linked user', linkedUserId, 'to enrollment');
            } catch (linkError) {
              console.error('[ADMISSION] Failed to link user to enrollment:', linkError);
            }
          }
          
          // Step 3: Send email (non-critical)
          const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
          if (!smtpConfigured) {
            console.log('[ADMISSION] SMTP not configured. Skipping email. Set SMTP_USER and SMTP_PASS in .env file.');
            console.log('[ADMISSION] SMTP not configured. Student account created for:', currentEnrollment.email);
          } else if (tempPassword) {
            try {
              emailResult = await sendAdmissionEmail({
                to: currentEnrollment.email,
                fullName: currentEnrollment.fullName,
                courseName: currentEnrollment.course?.title || 'Unknown Course',
                email: currentEnrollment.email,
                password: tempPassword,
                loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
              });
              
              if (emailResult.success) {
                console.log('[ADMISSION] Email sent to:', currentEnrollment.email);
              } else {
                console.error('[ADMISSION] Email failed:', emailResult.error);
              }
            } catch (emailErr) {
              console.error('[ADMISSION] Email exception:', emailErr);
            }
          }
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

        if (emailResult?.success) {
          console.log('Email notification sent successfully');
        } else if (emailResult) {
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
