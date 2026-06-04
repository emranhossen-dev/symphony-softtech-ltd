import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[slug]/stats - Get course statistics (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get course by slug to get courseId
    const course = await prisma?.course.findUnique({
      where: { slug }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get course enrollments count
    const totalEnrollments = await prisma?.enrollment.count({
      where: { courseId: course.id }
    });

    // Get course modules count
    const totalModules = await prisma?.module.count({
      where: { courseId: course.id }
    });

    // Get average rating (mock data for now)
    const averageRating = 4.5 + Math.random() * 0.5;
    const totalReviews = Math.floor(Math.random() * 100) + 20;
    const completionRate = Math.floor(Math.random() * 30) + 70;

    const stats = {
      totalStudents: totalEnrollments || 0,
      averageRating,
      totalReviews,
      completionRate,
      difficulty: 'Beginner' as const,
      language: 'Bangla',
      certificate: true,
      subtitles: ['Bangla', 'English'],
      totalModules
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching course stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch course statistics'
      },
      { status: 500 }
    );
  }
}
