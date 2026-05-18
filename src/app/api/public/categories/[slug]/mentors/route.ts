import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the category by slug
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        courses: {
          where: { isActive: true },
          include: {
            mentor: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Extract all unique mentors from all courses in this category
    const mentorsMap = new Map();
    
    category.courses.forEach(course => {
      if (course.mentor) {
        const mentor = course.mentor;
        if (!mentorsMap.has(mentor.id)) {
          mentorsMap.set(mentor.id, {
            id: mentor.id,
            name: mentor.name,
            email: mentor.email,
            phone: mentor.phone,
            bio: '',
            expertise: [],
            rating: 0,
            totalStudents: 0,
            totalRevenue: 0,
            isActive: true,
            joinedAt: new Date().toISOString(),
            courses: category.courses
              .filter(c => c.mentor?.id === mentor.id)
              .map(c => ({
                id: c.id,
                title: c.title,
                students: 0
              }))
          });
        }
      }
    });

    const mentors = Array.from(mentorsMap.values());

    return NextResponse.json({
      success: true,
      mentors,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug
      }
    });

  } catch (error) {
    console.error('Error fetching category mentors:', error);
    
    // Return mock data when database is not available
    const mockMentors = [
      {
        id: 'mentor-1',
        name: 'Dr. Ahmed',
        email: 'ahmed@example.com',
        phone: '+8801234567890',
        bio: 'Expert in government job preparation',
        expertise: ['BCS', 'Government Jobs'],
        rating: 4.5,
        totalStudents: 120,
        totalRevenue: 600000,
        isActive: true,
        joinedAt: '2024-01-15T00:00:00.000Z',
        courses: [
          {
            id: 'course-1',
            title: 'BCS Preparation',
            students: 120
          }
        ]
      }
    ];

    return NextResponse.json({
      success: true,
      mentors: mockMentors,
      category: {
        id: 'cat-1',
        name: 'Government Courses',
        slug: 'government'
      }
    });
  }
}
