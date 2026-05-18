import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/courses/[courseId]/stats - Get course statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Get course enrollments count
    const totalEnrollments = await prisma?.enrollment.count({
      where: { courseId }
    });

    // Get course modules count
    const totalModules = await prisma?.module.count({
      where: { courseId }
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
