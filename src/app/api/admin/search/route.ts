import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hasRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      return NextResponse.json(
        { error: 'Admin or Employee access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
        message: 'Query too short'
      });
    }

    const searchQuery = query.trim();
    const results: any[] = [];

    try {
      // Search students
      const students = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true
        }
      });

      students.forEach(student => {
        results.push({
          id: student.id,
          title: student.name,
          subtitle: student.email,
          type: 'student',
          url: `/admin/students/${student.id}`,
          status: student.isActive ? 'Active' : 'Inactive'
        });
      });

      // Search mentors
      const mentors = await prisma.user.findMany({
        where: {
          role: 'MENTOR',
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phone: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true
        }
      });

      mentors.forEach(mentor => {
        results.push({
          id: mentor.id,
          title: mentor.name,
          subtitle: mentor.email,
          type: 'mentor',
          url: `/admin/mentors/${mentor.id}`,
          status: mentor.isActive ? 'Active' : 'Inactive'
        });
      });

      // Search courses
      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          isActive: true,
          price: true
        }
      });

      courses.forEach(course => {
        results.push({
          id: course.id,
          title: course.title,
          subtitle: `${course.category} • ৳${course.price}`,
          type: 'course',
          url: `/admin/courses/${course.id}`,
          status: course.isActive ? 'Active' : 'Inactive'
        });
      });

      // Search enrollments
      const enrollments = await prisma.enrollment.findMany({
        where: {
          OR: [
            { fullName: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } },
            { phoneNumber: { contains: searchQuery, mode: 'insensitive' } },
            { courseName: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          courseName: true,
          enrollmentStatus: true,
          createdAt: true
        }
      });

      enrollments.forEach(enrollment => {
        results.push({
          id: enrollment.id,
          title: enrollment.fullName,
          subtitle: `${enrollment.courseName} • ${enrollment.email}`,
          type: 'enrollment',
          url: `/admin/enrollments/${enrollment.id}`,
          status: enrollment.enrollmentStatus
        });
      });

    } catch (dbError) {
      console.error('Database search error:', dbError);
      // Return empty results if database fails
    }

    // Sort results by relevance (title match first)
    results.sort((a, b) => {
      const aScore = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1;
      const bScore = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1;
      return bScore - aScore;
    });

    return NextResponse.json({
      success: true,
      query: searchQuery,
      results: results.slice(0, 10), // Limit to 10 results
      total: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
