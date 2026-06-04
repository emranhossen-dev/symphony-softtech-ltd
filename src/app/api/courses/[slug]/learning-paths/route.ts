import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[slug]/learning-paths - Get course learning paths
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Mock learning paths data
    const paths = [
      {
        id: 'beginner-path',
        title: 'Beginner Path',
        description: 'Perfect for those starting from scratch',
        modules: ['Introduction', 'Basic Concepts', 'First Project'],
        estimatedTime: '4 weeks',
        difficulty: 'Beginner'
      },
      {
        id: 'intermediate-path',
        title: 'Intermediate Path',
        description: 'For those with some prior experience',
        modules: ['Advanced Concepts', 'Real Projects', 'Best Practices'],
        estimatedTime: '6 weeks',
        difficulty: 'Intermediate'
      },
      {
        id: 'advanced-path',
        title: 'Advanced Path',
        description: 'Master level techniques and concepts',
        modules: ['Expert Topics', 'Complex Projects', 'Optimization'],
        estimatedTime: '8 weeks',
        difficulty: 'Advanced'
      }
    ];

    return NextResponse.json({
      success: true,
      paths
    });

  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch learning paths'
      },
      { status: 500 }
    );
  }
}
