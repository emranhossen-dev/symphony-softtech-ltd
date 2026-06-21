import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { getUserFromToken } = await import('@/lib/auth');
    const user = await getUserFromToken(token);

    if (!user || user.role !== 'MENTOR') {
      return NextResponse.json({ error: 'Mentor access required' }, { status: 403 });
    }

    const submissionId = id;
    const body = await request.json();
    const { status, feedback, marks } = body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Use APPROVED or REJECTED' }, { status: 400 });
    }

    // Find submission with student and module info for notification
    const existingSubmission = await prisma.homeworkSubmission.findFirst({
      where: { id: submissionId },
      include: {
        module: { select: { title: true } },
        course: { select: { title: true } },
        user: { select: { name: true, email: true } }
      }
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Get the course to check mentor
    const course = await prisma.course.findFirst({
      where: { id: existingSubmission.courseId, mentorId: user.id }
    });

    if (!course) {
      return NextResponse.json({ error: 'Access denied - not your course' }, { status: 403 });
    }

    // Update using raw SQL to avoid Prisma issues
    const reviewedAt = new Date().toISOString();
    const safeFeedback = feedback ? feedback.replace(/'/g, "''") : null;
    const marksValue = marks !== undefined && marks !== '' ? parseInt(marks) : null;
    
    const updateQuery = `
      UPDATE homework_submissions 
      SET status = '${status}', 
          feedback = ${safeFeedback ? `'${safeFeedback}'` : 'NULL'}, 
          marks = ${marksValue !== null ? marksValue : 'NULL'}, 
          "mentorId" = '${user.id}', 
          "reviewedAt" = '${reviewedAt}'
      WHERE id = '${submissionId}'
    `;
    
    await prisma.$executeRawUnsafe(updateQuery);

    // Send notification to student
    const moduleName = existingSubmission.module?.title || 'your homework';
    const courseName = existingSubmission.course?.title || 'your course';
    const isApproved = status === 'APPROVED';

    await prisma.notification.create({
      data: {
        userId: existingSubmission.userId,
        type: isApproved ? 'HOMEWORK_APPROVED' : 'HOMEWORK_REJECTED',
        title: isApproved ? '🎉 Homework Approved!' : '❌ Homework Needs Revision',
        message: isApproved
          ? `Your homework for "${moduleName}" in "${courseName}" has been approved!${marksValue !== null ? ` Marks: ${marksValue}.` : ''} ${feedback ? `Feedback: ${feedback}` : 'Great work!'}`
          : `Your homework for "${moduleName}" in "${courseName}" was reviewed.${feedback ? ` Feedback: ${feedback}` : ' Please revise and resubmit.'}`
      }
    });

    // Send email notification to student
    if (existingSubmission.user?.email) {
      try {
        const { sendHomeworkGradedEmail } = await import('@/lib/email');
        await sendHomeworkGradedEmail({
          to: existingSubmission.user.email,
          fullName: existingSubmission.user.name || 'Student',
          homeworkTitle: moduleName,
          courseName: courseName,
          status: status as 'APPROVED' | 'REJECTED',
          marks: marksValue,
          feedback: feedback || null
        });
      } catch (emailError) {
        console.error('Failed to send homework graded email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Homework graded successfully'
    });

  } catch (error: any) {
    console.error('GRADING ERROR:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to grade homework',
        code: error.code,
      },
      { status: 500 }
    );
  }
}

