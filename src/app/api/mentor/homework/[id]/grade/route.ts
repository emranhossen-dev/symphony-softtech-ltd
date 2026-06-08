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

    // Find submission with its course info
    const existingSubmission = await (prisma as any).homeworkSubmission.findFirst({
      where: { id: submissionId }
    });

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Get the course to check mentor
    const course = await (prisma as any).course.findFirst({
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
        meta: error.meta,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
