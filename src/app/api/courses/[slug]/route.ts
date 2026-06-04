import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[slug] - Get single course for students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string = '';
  try {
    const { slug: courseSlug } = await params;
    slug = courseSlug;

    const course = await prisma?.course.findUnique({
      where: { slug: slug },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course not found'
        },
        { status: 404 }
      );
    }

    // Only return active courses to students
    if (!course.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Course is not available'
        },
        { status: 403 }
      );
    }

    // Get related courses from same category
    const relatedCourses = await prisma?.course.findMany({
      where: {
        id: { not: course.id },
        category: course.category,
        isActive: true
      },
      take: 3,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        thumbnail: true,
        category: true,
        price: true,
        duration: true
      }
    });

    return NextResponse.json({
      success: true,
      course,
      relatedCourses: relatedCourses || []
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Course not found'
      },
      { status: 404 }
    );
  }
}