import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/security';

export const GET = requireRole(['MENTOR'])(
  async (request: NextRequest) => {
    try {
      const user = (request as any).user;
      
      const quizzes = await prisma.quiz.findMany({
        where: {
          mentorId: user.id
        },
        include: {
          course: {
            select: {
              title: true,
              id: true
            }
          },
          _count: {
            select: {
              attempts: true,
              questions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        quizzes
      });
    } catch (error) {
      console.error('Error fetching mentor quizzes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quizzes' },
        { status: 500 }
      );
    }
  }
);

export const POST = requireRole(['MENTOR'])(
  async (request: NextRequest) => {
    try {
      const user = (request as any).user;
      const { title, description, courseId, questions } = await request.json();

      if (!title || !courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: 'Missing required fields or questions' }, { status: 400 });
      }

      // Verify the mentor has access to this course (they are the mentor of it)
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course || course.mentorId !== user.id) {
        return NextResponse.json({ error: 'You do not have permission to create a quiz for this batch' }, { status: 403 });
      }

      const newQuiz = await prisma.quiz.create({
        data: {
          title,
          description,
          courseId,
          mentorId: user.id,
          questions: {
            create: questions.map((q: any, index: number) => ({
              text: q.text,
              options: q.options,
              correctAns: q.correctAns,
              order: index
            }))
          }
        },
        include: {
          questions: true
        }
      });

      return NextResponse.json({
        success: true,
        quiz: newQuiz
      });
    } catch (error) {
      console.error('Error creating quiz:', error);
      return NextResponse.json(
        { error: 'Failed to create quiz' },
        { status: 500 }
      );
    }
  }
);
