import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  try {

    // Check if database is available
    if (!prisma) {
      // Return mock data if database is not available
      const mockMentors = slug === 'government' ? [
        {
          id: 'mentor-1',
          name: 'Dr. Karim Ahmed',
          email: 'karim@example.com',
          phone: '01712345678',
          bio: 'Experienced BCS mentor with 10+ years of experience',
          expertise: ['BCS Preparation', 'Current Affairs', 'English'],
          rating: 4.8,
          totalStudents: 150,
          totalRevenue: 750000,
          isActive: true,
          joinedAt: '2023-01-15T00:00:00.000Z',
          courses: [
            { id: 'course-1', title: 'BCS Preliminary Preparation', students: 75 },
            { id: 'course-2', title: 'BCS Written Preparation', students: 50 }
          ]
        },
        {
          id: 'mentor-2',
          name: 'Prof. Rahman Khan',
          email: 'rahman@example.com',
          phone: '01898765432',
          bio: 'Expert in Bank Job preparation with banking background',
          expertise: ['Bank Jobs', 'Mathematics', 'Reasoning'],
          rating: 4.6,
          totalStudents: 120,
          totalRevenue: 600000,
          isActive: true,
          joinedAt: '2023-03-20T00:00:00.000Z',
          courses: [
            { id: 'course-3', title: 'Bank Job Preparation', students: 60 },
            { id: 'course-4', title: 'Mathematics for Banking', students: 40 }
          ]
        }
      ] : [
        {
          id: 'mentor-3',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '01912345678',
          bio: 'Web development expert',
          expertise: ['React', 'Node.js', 'JavaScript'],
          rating: 4.5,
          totalStudents: 80,
          totalRevenue: 400000,
          isActive: true,
          joinedAt: '2023-02-10T00:00:00.000Z',
          courses: [
            { id: 'course-5', title: 'Web Development Bootcamp', students: 40 }
          ]
        }
      ];

      return NextResponse.json({
        success: true,
        mentors: mockMentors,
        category: {
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug: slug
        }
      });
    }
    
    // Find all courses in this category with their mentors
    const courses = await prisma.course.findMany({
      where: { 
        OR: [
          { categoryId: slug },
          { categoryRelation: { slug: slug } }
        ]
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    }).catch(error => {
      console.error('Database query failed:', error);
      throw error;
    });

    if (courses.length === 0) {
      return NextResponse.json({
        success: true,
        mentors: [],
        category: {
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug: slug
        }
      });
    }

    // Extract all unique mentors from all courses in this category
    const mentorsMap = new Map();
    
    courses.forEach((course: any) => {
      if (course.mentor && !mentorsMap.has(course.mentor.id)) {
        const mentorCourses = courses
          .filter((c: any) => c.mentor?.id === course.mentor.id)
          .map((c: any) => ({
            id: c.id,
            title: c.title,
            students: 0 // TODO: Calculate actual enrollment count
          }));

        mentorsMap.set(course.mentor.id, {
          id: course.mentor.id,
          name: course.mentor.name,
          email: course.mentor.email,
          phone: course.mentor.phone,
          bio: '', // TODO: Add bio field to User model if needed
          expertise: [], // TODO: Add expertise field to User model if needed
          rating: 4.5, // TODO: Add rating field to User model if needed
          totalStudents: 0, // TODO: Calculate from enrollments
          totalRevenue: 0, // TODO: Calculate from payments
          isActive: true, // TODO: Add isActive field to User model if needed
          joinedAt: new Date().toISOString(), // TODO: Use actual createdAt from User
          courses: mentorCourses
        });
      }
    });

    const mentors = Array.from(mentorsMap.values());

    return NextResponse.json({
      success: true,
      mentors,
      category: {
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug: slug
      }
    });

  } catch (error: any) {
    console.error('Error fetching category mentors:', error);
    
    // If it's a database connection error, return mock data
    if (error.message && error.message.includes('DATABASE_URL')) {
      const mockMentors = slug === 'government' ? [
        {
          id: 'mentor-1',
          name: 'Dr. Karim Ahmed',
          email: 'karim@example.com',
          phone: '01712345678',
          bio: 'Experienced BCS mentor with 10+ years of experience',
          expertise: ['BCS Preparation', 'Current Affairs', 'English'],
          rating: 4.8,
          totalStudents: 150,
          totalRevenue: 750000,
          isActive: true,
          joinedAt: '2023-01-15T00:00:00.000Z',
          courses: [
            { id: 'course-1', title: 'BCS Preliminary Preparation', students: 75 },
            { id: 'course-2', title: 'BCS Written Preparation', students: 50 }
          ]
        }
      ] : [
        {
          id: 'mentor-2',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '01912345678',
          bio: 'Web development expert',
          expertise: ['React', 'Node.js', 'JavaScript'],
          rating: 4.5,
          totalStudents: 80,
          totalRevenue: 400000,
          isActive: true,
          joinedAt: '2023-02-10T00:00:00.000Z',
          courses: [
            { id: 'course-3', title: 'Web Development Bootcamp', students: 40 }
          ]
        }
      ];

      return NextResponse.json({
        success: true,
        mentors: mockMentors,
        category: {
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug: slug
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch mentors' },
      { status: 500 }
    );
  }
}
