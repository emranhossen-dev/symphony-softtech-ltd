import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const mentor = searchParams.get('mentor');

    let where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (mentor && mentor !== 'all') {
      where.mentorId = mentor;
    }

    // Fetch courses with mentor and enrollment counts
    const courses = await (prisma as any).course.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to include enrolled count
    const transformedCourses = courses.map((course: any) => ({
      ...course,
      enrolledCount: course.enrollments.length
    }));

    return NextResponse.json({
      success: true,
      courses: transformedCourses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      category,
      price,
      duration,
      level,
      thumbnail,
      mentorId,
      isActive
    } = await request.json();

    if (!title || !description || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Title, description, category, and price are required' },
        { status: 400 }
      );
    }

    const newCourse = await (prisma as any).course.create({
      data: {
        title,
        description,
        category,
        price,
        duration: duration || null,
        thumbnail: thumbnail || null,
        mentorId: mentorId || null,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      course: { ...newCourse, enrolledCount: 0 }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      title,
      description,
      category,
      price,
      duration,
      level,
      thumbnail,
      mentorId,
      isActive
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const updatedCourse = await (prisma as any).course.update({
      where: { id },
      data: {
        title,
        description,
        category,
        price,
        duration: duration || null,
        thumbnail: thumbnail || null,
        mentorId: mentorId || null,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      course: { ...updatedCourse, enrolledCount: updatedCourse.enrollments.length }
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if course has enrollments
    const enrollmentCount = await (prisma as any).enrollment.count({
      where: { courseId }
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments' },
        { status: 400 }
      );
    }

    await (prisma as any).course.delete({
      where: { id: courseId }
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
