import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(request: NextRequest) {
  try {
    const { homeworkId, files } = await request.json();

    if (!homeworkId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Homework ID and files are required' },
        { status: 400 }
      );
    }

    // In a real application, you'd get the student ID from the session/auth token
    const studentId = 'current-student-id'; // This would come from auth

    // Create homework submission
    const submission = await (prisma as any).homeworkSubmission.create({
      data: {
        homeworkId,
        studentId,
        files: {
          create: files.map((file: any) => ({
            name: file.name,
            content: file.content,
            language: file.language,
            size: file.content.length
          }))
        },
        submittedAt: new Date(),
        status: 'SUBMITTED'
      },
      include: {
        files: true,
        homework: {
          include: {
            course: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      }
    });

    // Update homework status if needed
    const homework = await (prisma as any).homework.findUnique({
      where: { id: homeworkId },
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        homeworkId: submission.homeworkId,
        submittedAt: submission.submittedAt.toISOString(),
        status: submission.status,
        files: submission.files.map((file: any) => ({
          id: file.id,
          name: file.name,
          language: file.language,
          size: file.size
        })),
        homework: submission.homework
      }
    });
  } catch (error) {
    console.error('Error submitting homework:', error);
    return NextResponse.json(
      { error: 'Failed to submit homework' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
