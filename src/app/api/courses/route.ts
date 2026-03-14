import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET /api/courses - Get active courses for public landing page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '12');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true
            }
          },
          mentor: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.course.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Get category counts
    const categoryCounts = await prisma.course.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true
    });

    const categories = [
      { value: 'GOVERNMENT', label: 'Government Exams', count: categoryCounts.find(c => c.category === 'GOVERNMENT')?._count || 0 },
      { value: 'RECORDED', label: 'Recorded Courses', count: categoryCounts.find(c => c.category === 'RECORDED')?._count || 0 },
      { value: 'ONLINE', label: 'Online Live', count: categoryCounts.find(c => c.category === 'ONLINE')?._count || 0 },
      { value: 'OFFLINE', label: 'Offline Classes', count: categoryCounts.find(c => c.category === 'OFFLINE')?._count || 0 }
    ];

    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      categories
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch courses'
      },
      { status: 500 }
    );
  }
}
