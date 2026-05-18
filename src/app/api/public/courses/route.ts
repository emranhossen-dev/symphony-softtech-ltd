import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper functions for category fallbacks
function getFallbackCategory(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'GOVERNMENT': 'Government Courses',
    'ONLINE': 'Online Courses',
    'OFFLINE': 'Offline Courses',
    'RECORDED': 'Recorded Courses',
    'government': 'Government Courses',
    'online': 'Online Courses',
    'offline': 'Offline Courses',
    'recorded': 'Recorded Courses'
  };
  return categoryMap[category] || 'General Courses';
}

function getFallbackSlug(category: string): string {
  const slugMap: { [key: string]: string } = {
    'GOVERNMENT': 'government',
    'ONLINE': 'online',
    'OFFLINE': 'offline',
    'RECORDED': 'recorded',
    'government': 'government',
    'online': 'online',
    'offline': 'offline',
    'recorded': 'recorded'
  };
  return slugMap[category] || 'general';
}

export async function GET(request: NextRequest) {
  console.log('🚀 API Called: /api/public/courses');
  
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured') === 'true';
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');

  console.log('📋 Query params:', { featured, limit, category });

  try {
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection OK');
    
    // Build where clause - simplified
    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    if (featured) {
      where.featured = true;
    }

    console.log('🔍 Where clause:', where);

    // Fetch courses with mentor and category info
    const courses = await prisma.course.findMany({
      where,
      include: {
        mentor: {
          select: {
            name: true
          }
        },
        categoryRelation: {
          select: {
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${courses.length} courses in database`);
    courses.forEach((course, i) => {
      console.log(`${i+1}. ${course.title} - Price: ${course.price} - Category: ${course.category}`);
    });

    // Transform data to match expected interface
    const transformedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      shortDescription: course.shortDescription || '',
      thumbnail: course.thumbnail || '',
      price: course.price || 0,
      duration: course.duration || '',
      level: 'Beginner', // Default level
      mentor: course.mentor?.name || 'Unknown',
      category: course.categoryRelation?.name || getFallbackCategory(course.category),
      categorySlug: course.categoryRelation?.slug || getFallbackSlug(course.category),
      isActive: course.isActive,
      featured: (course as any).featured || false,
      rating: 4.5, // Default rating
      reviewCount: Math.floor(Math.random() * 50) + 10, // Random review count
      enrollmentCount: course._count?.enrollments || 0,
      moduleCount: course._count?.modules || 0
    }));

    return NextResponse.json({
      success: true,
      courses: transformedCourses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    console.error('Error details:', (error as Error).message);
    
    // Return empty array instead of mock data to force real data usage
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch courses',
      courses: []
    }, { status: 500 });
  }
}
