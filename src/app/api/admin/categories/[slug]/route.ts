import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { logActivity, ActivityType, extractRequestInfo } from '@/lib/activity-logger';

// Force Node.js runtime for JWT verification
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'details' or 'mentors'

    // For category details, require authentication
    if (type === 'details') {
      const token = request.cookies.get('auth_token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        );
      }

      const user = verifyToken(token);
      
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      // Mock category details data
      const category = {
        id: slug,
        name: 'Web Development',
        description: 'Learn modern web technologies including HTML, CSS, JavaScript, React, Node.js',
        color: '#3B82F6',
        icon: '💻',
        isActive: true,
        courseCount: 12,
        enrollmentCount: 156,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        courses: [
          { id: '1', title: 'HTML & CSS Basics', duration: '4 weeks', students: 45 },
          { id: '2', title: 'JavaScript Fundamentals', duration: '6 weeks', students: 38 },
          { id: '3', title: 'React Development', duration: '8 weeks', students: 32 },
          { id: '4', title: 'Node.js Backend', duration: '10 weeks', students: 28 },
          { id: '5', title: 'Database Design', duration: '3 weeks', students: 13 }
        ],
        enrollments: [
          { id: '1', studentName: 'John Doe', enrolledAt: '2024-01-15', progress: 85 },
          { id: '2', studentName: 'Jane Smith', enrolledAt: '2024-01-20', progress: 92 },
          { id: '3', studentName: 'Bob Johnson', enrolledAt: '2024-02-01', progress: 67 }
        ]
      };

      return NextResponse.json({
        success: true,
        category
      });
    }

    // Default: return mentors data for the category
    const mockMentorsByCategory: Record<string, any[]> = {
      government: [
        {
          id: 'mentor-1',
          name: 'Dr. Ahmed Khan',
          email: 'ahmed.khan@example.com',
          phone: '+8801234567890',
          image: null,
          rating: 4.8,
          totalStudents: 45,
          totalRevenue: 450000,
          isActive: true,
          joinedAt: '2024-01-15T00:00:00.000Z',
          bio: 'Expert in government policy and public administration',
          expertise: ['Government Policy', 'Public Administration', 'Civil Service'],
          courses: [
            { id: 'course-1', title: 'Government Policy Analysis', students: 25 },
            { id: 'course-2', title: 'Public Administration', students: 20 }
          ]
        },
        {
          id: 'mentor-2',
          name: 'Prof. Fatema Rahman',
          email: 'fatema.rahman@example.com',
          phone: '+8801234567891',
          image: null,
          rating: 4.6,
          totalStudents: 38,
          totalRevenue: 380000,
          isActive: true,
          joinedAt: '2024-02-20T00:00:00.000Z',
          bio: 'Specialized in civil service preparation and government exams',
          expertise: ['Civil Service', 'Government Exams', 'Public Policy'],
          courses: [
            { id: 'course-3', title: 'Civil Service Preparation', students: 38 }
          ]
        }
      ],
      online: [
        {
          id: 'mentor-3',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+8801234567892',
          image: null,
          rating: 4.7,
          totalStudents: 62,
          totalRevenue: 620000,
          isActive: true,
          joinedAt: '2024-01-10T00:00:00.000Z',
          bio: 'Full-stack developer and digital marketing expert',
          expertise: ['Web Development', 'Digital Marketing', 'E-commerce'],
          courses: [
            { id: 'course-4', title: 'Web Development', students: 35 },
            { id: 'course-5', title: 'Digital Marketing', students: 27 }
          ]
        },
        {
          id: 'mentor-4',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+8801234567893',
          image: null,
          rating: 4.9,
          totalStudents: 71,
          totalRevenue: 710000,
          isActive: true,
          joinedAt: '2024-03-05T00:00:00.000Z',
          bio: 'Data scientist and machine learning specialist',
          expertise: ['Data Science', 'Machine Learning', 'Python'],
          courses: [
            { categoryId: 'course-6', title: 'Data Science', students: 71 }
          ]
        }
      ],
      offline: [
        {
          id: 'mentor-5',
          name: 'Michael Brown',
          email: 'michael.brown@example.com',
          phone: '+8801234567894',
          image: null,
          rating: 4.5,
          totalStudents: 28,
          totalRevenue: 280000,
          isActive: true,
          joinedAt: '2024-02-15T00:00:00.000Z',
          bio: 'Business management and entrepreneurship expert',
          expertise: ['Business Management', 'Entrepreneurship', 'Leadership'],
          courses: [
            { id: 'course-7', title: 'Business Management', students: 28 }
          ]
        }
      ],
      recorded: [
        {
          id: 'mentor-6',
          name: 'Emily Davis',
          email: 'emily.davis@example.com',
          phone: '+8801234567895',
          image: null,
          rating: 4.8,
          totalStudents: 89,
          totalRevenue: 445000,
          isActive: true,
          joinedAt: '2024-01-25T00:00:00.000Z',
          bio: 'Professional photographer and video editing expert',
          expertise: ['Photography', 'Video Editing', 'Content Creation'],
          courses: [
            { id: 'course-8', title: 'Photography Basics', students: 45 },
            { id: 'course-9', title: 'Video Editing', students: 44 }
          ]
        }
      ]
    };

    const mentors = mockMentorsByCategory[slug] || [];

    return NextResponse.json({
      success: true,
      mentors: mentors,
      category: slug,
      total: mentors.length
    });

  } catch (error) {
    console.error('Error fetching category mentors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category mentors' },
      { status: 500 }
    );
  }
}
