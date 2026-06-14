import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, AuthError } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 });
    }

    // 1. Fetch the student's active course enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        enrollmentStatus: 'ADMITTED'
      },
      select: {
        courseId: true
      }
    });

    const courseIds = enrollments
      .map(e => e.courseId)
      .filter((id): id is string => id !== null);

    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, quizzes: [] });
    }

    // 2. Fetch quizzes for these courses
    const quizzes = await prisma.quiz.findMany({
      where: {
        courseId: {
          in: courseIds
        },
        isActive: true
      },
      include: {
        course: {
          select: {
            title: true
          }
        },
        attempts: {
          where: {
            studentId: user.id
          },
          select: {
            id: true,
            score: true,
            totalMarks: true,
            submittedAt: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 3. Format data
    const formattedQuizzes = quizzes.map(quiz => {
      const attempt = quiz.attempts[0]; // Assuming one attempt per student, or taking the latest
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        courseName: quiz.course.title,
        questionCount: quiz._count.questions,
        createdAt: quiz.createdAt,
        attempt: attempt ? {
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          submittedAt: attempt.submittedAt
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      quizzes: formattedQuizzes
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error fetching student quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
