import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
    console.log('Testing admissions route for slug:', slug);

    // Simple test response
    return NextResponse.json({
      success: true,
      message: 'Admissions route is working',
      slug: slug,
      category: {
        id: slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug: slug,
        description: `${slug.charAt(0).toUpperCase() + slug.slice(1)} training programs`,
        color: slug === 'government' ? 'green' : slug === 'online' ? 'blue' : slug === 'offline' ? 'purple' : 'orange',
        icon: slug === 'government' ? '🏛️' : slug === 'online' ? '💻' : slug === 'offline' ? '📚' : '🎥'
      },
      students: [],
      stats: {
        applied: 0,
        waiting: 0,
        admitted: 0,
        nextBatch: 0,
        rejected: 0,
        totalRevenue: 0,
        activeMentors: 0,
        completionRate: 0,
        monthlyGrowth: 0,
        totalCourses: 0,
        activeStudents: 0,
        averageRating: 0
      }
    });

  } catch (error) {
    console.error('Error in test admissions route:', error);
    return NextResponse.json(
      { success: false, error: 'Test route failed' },
      { status: 500 }
    );
  }
}
