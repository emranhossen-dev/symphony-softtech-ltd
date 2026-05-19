import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createStudentUser } from '@/lib/auth';
import { sendAdmissionEmail } from '@/lib/email';

// Map slugs to category strings
const slugToCategory: Record<string, string> = {
  'government': 'government',
  'online': 'online',
  'offline': 'offline-courses',
  'recorded': 'recorded'
};

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ slug: string; enrollmentId: string }> }
) {
  try {
    const { slug, enrollmentId } = await params;
    const body = await request.json();

    console.log(`Updating enrollment ${enrollmentId} in category ${slug} with:`, body);

    // Check if database is available
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    // Map slug to category string
    const categoryString = slugToCategory[slug];
    if (!categoryString) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 404 }
      );
    }

    // First, check if the enrollment exists and belongs to this category
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            categoryRelation: true
          }
        },
        category: true,
        payments: true
      }
    });

    if (!enrollment) {
      console.log(`Enrollment ${enrollmentId} not found`);
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if enrollment belongs to the specified category
    const belongsToCategory = 
      enrollment.category?.slug === categoryString ||
      enrollment.course?.categoryRelation?.slug === slug ||
      enrollment.courseName?.toLowerCase().includes(slug.toLowerCase());

    if (!belongsToCategory) {
      console.log(`Enrollment ${enrollmentId} does not belong to category ${slug}`);
      return NextResponse.json(
        { success: false, error: 'Enrollment does not belong to this category' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update enrollment status if provided
    if (body.status && ['APPLIED', 'ADMITTED', 'REJECTED', 'WAITING', 'NEXT_BATCH'].includes(body.status)) {
      updateData.enrollmentStatus = body.status;
      
      // If status is being changed to ADMITTED, create user account and send email
      if (body.status === 'ADMITTED' && enrollment.enrollmentStatus !== 'ADMITTED') {
        console.log(`Admitting student ${enrollmentId}, creating user account and sending email...`);
        
        try {
          // Create student user with temporary password
          const { user, tempPassword } = await createStudentUser({
            fullName: enrollment.fullName,
            email: enrollment.email,
            phoneNumber: enrollment.phoneNumber
          });

          console.log(`Created user ${user.id} for student ${enrollmentId}`);

          // Link user to enrollment
          updateData.userId = user.id;

          // Send admission email with password
          if (tempPassword) {
            const emailResult = await sendAdmissionEmail({
              to: enrollment.email,
              fullName: enrollment.fullName,
              courseName: enrollment.courseName || enrollment.course?.title || 'Course',
              email: enrollment.email,
              password: tempPassword,
              loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`
            });

            if (emailResult.success) {
              console.log(`Admission email sent to ${enrollment.email}`);
            } else {
              console.error(`Failed to send admission email: ${emailResult.error}`);
            }
          } else {
            console.log(`User already exists for ${enrollment.email}, skipping email`);
          }
        } catch (error) {
          console.error('Error creating user or sending email:', error);
          // Don't fail the admission if email fails, just log the error
        }
      }
    }

    // Update payment status if provided
    if (body.paymentStatus && ['PENDING', 'PAID', 'FAILED'].includes(body.paymentStatus)) {
      updateData.paymentStatus = body.paymentStatus;
      
      // If there's a payment record, update it too
      if (enrollment.payments && enrollment.payments.length > 0) {
        await prisma.payment.update({
          where: { id: enrollment.payments[0].id },
          data: {
            paymentStatus: body.paymentStatus,
            updatedAt: new Date()
          }
        });
      }
    }

    // Update the enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
      include: {
        payments: true,
        course: {
          include: {
            mentor: {
              select: {
                name: true
              }
            },
            categoryRelation: true
          }
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    console.log(`Successfully updated enrollment ${enrollmentId}`);

    // Transform the response to match the expected format
    const transformedEnrollment = {
      id: updatedEnrollment.id,
      name: updatedEnrollment.fullName,
      phone: updatedEnrollment.phoneNumber,
      email: updatedEnrollment.email,
      status: updatedEnrollment.enrollmentStatus,
      paymentStatus: updatedEnrollment.payments && updatedEnrollment.payments.length > 0 
        ? updatedEnrollment.payments[0].paymentStatus 
        : 'NOT_REQUIRED',
      courseName: updatedEnrollment.courseName || updatedEnrollment.course?.title || 'Unknown Course',
      amount: updatedEnrollment.payments && updatedEnrollment.payments.length > 0 
        ? updatedEnrollment.payments[0].amount 
        : 0,
      assignedMentor: updatedEnrollment.course?.mentor?.name,
      appliedDate: updatedEnrollment.createdAt.toISOString(),
      avatar: updatedEnrollment.fullName.charAt(0).toUpperCase(),
      categoryId: slug
    };

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully',
      enrollment: transformedEnrollment
    });

  } catch (error) {
    console.error('Error updating enrollment:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { success: false, error: 'Enrollment not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update enrollment' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ slug: string; enrollmentId: string }> }
) {
  try {
    const { slug, enrollmentId } = await params;

    console.log(`Deleting enrollment ${enrollmentId} from category ${slug}`);

    // Check if database is available
    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    // Map slug to category string
    const categoryString = slugToCategory[slug];
    if (!categoryString) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 404 }
      );
    }

    // First, check if the enrollment exists and belongs to this category
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            categoryRelation: true
          }
        },
        category: true
      }
    });

    if (!enrollment) {
      console.log(`Enrollment ${enrollmentId} not found`);
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if enrollment belongs to the specified category
    const belongsToCategory = 
      enrollment.category?.slug === categoryString ||
      enrollment.course?.categoryRelation?.slug === slug ||
      enrollment.courseName?.toLowerCase().includes(slug.toLowerCase());

    if (!belongsToCategory) {
      console.log(`Enrollment ${enrollmentId} does not belong to category ${slug}`);
      return NextResponse.json(
        { success: false, error: 'Enrollment does not belong to this category' },
        { status: 403 }
      );
    }

    // Delete related payments first (due to foreign key constraint)
    await prisma.payment.deleteMany({
      where: { enrollmentId: enrollmentId }
    });

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id: enrollmentId }
    });

    console.log(`Successfully deleted enrollment ${enrollmentId}`);

    return NextResponse.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting enrollment:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { success: false, error: 'Enrollment not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete enrollment due to related records' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete enrollment' 
      },
      { status: 500 }
    );
  }
}
