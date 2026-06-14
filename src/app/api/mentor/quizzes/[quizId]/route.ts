import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/security';

export const GET = requireRole(['MENTOR'])(
  async (request: NextRequest, { params }: { params: Promise<{ quizId: string }> }) => {
    try {
      const user = (request as any).user;
      const { quizId } = await params;

      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          course: {
            select: { title: true }
          },
          questions: true,
          attempts: {
            include: {
              student: {
                select: { name: true, email: true, avatar: true }
              }
            },
            orderBy: {
              submittedAt: 'desc'
            }
          }
        }
      });

      if (!quiz) {
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }

      if (quiz.mentorId !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        quiz
      });
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quiz details' },
        { status: 500 }
      );
    }
  }
);
