import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, AuthError } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 });
    }

    const { quizId } = await params;

    // Fetch quiz with questions but DO NOT send correct answers
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, isActive: true },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        attempts: {
          where: { studentId: user.id }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Strip correctAns from questions before sending to client
    const safeQuestions = quiz.questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      order: q.order
    }));

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: safeQuestions,
        hasAttempted: quiz.attempts.length > 0
      }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error fetching quiz details:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz details' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student access required' }, { status: 403 });
    }

    const { quizId } = await params;
    const { answers } = await request.json(); // Record<questionId, selectedOption>

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    // Check if already attempted
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId, studentId: user.id }
    });

    if (existingAttempt) {
      return NextResponse.json({ error: 'You have already attempted this quiz' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    let score = 0;
    const totalMarks = quiz.questions.length;
    const resultDetails: any[] = [];

    // Calculate score
    for (const question of quiz.questions) {
      const selectedOption = answers[question.id] || null;
      const isCorrect = selectedOption === question.correctAns;
      
      if (isCorrect) score++;

      resultDetails.push({
        questionId: question.id,
        text: question.text,
        options: question.options,
        selectedOption,
        correctAns: question.correctAns,
        isCorrect
      });
    }

    // Save attempt
    await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: user.id,
        score,
        totalMarks,
        answers: answers
      }
    });

    return NextResponse.json({
      success: true,
      score,
      totalMarks,
      resultDetails
    });

  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
