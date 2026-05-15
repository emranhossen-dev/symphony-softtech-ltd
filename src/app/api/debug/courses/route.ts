import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching courses...');
    
    // Get all courses with their category info
    const courses = await prisma.course.findMany({
      include: {
        categoryRelation: true
      }
    });

    console.log(`Debug: Found ${courses.length} courses`);

    const courseData = courses.map(course => ({
      id: course.id,
      title: course.title,
      categoryId: course.categoryId,
      category: course.categoryRelation,
      categoryString: course.category
    }));

    return NextResponse.json({
      success: true,
      totalCourses: courses.length,
      courses: courseData
    });

  } catch (error) {
    console.error('Debug: Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
