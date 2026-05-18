import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    // Check if prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const course = searchParams.get('course');
    const mentor = searchParams.get('mentor');
    const status = searchParams.get('status');

    let where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (course && course !== 'all') {
      where.category = course;
    }

    if (mentor && mentor !== 'all') {
      where.mentorId = mentor;
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    // Fetch courses with related data
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

    // Transform data to include current students count
    const transformedCourses = courses.map((course: any) => ({
      ...course,
      currentStudents: course.enrollments.length
    }));

    return NextResponse.json({
      success: true,
      batches: transformedCourses // Keep as batches for frontend compatibility
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      courseId,
      mentorId,
      schedule,
      maxStudents,
      startDate,
      endDate,
      location,
      deliveryMode,
      isActive
    } = await request.json();

    if (!name || !courseId || !mentorId || !schedule || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, course, mentor, schedule, and dates are required' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate max students
    if (maxStudents < 1 || maxStudents > 100) {
      return NextResponse.json(
        { error: 'Max students must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Create a course session instead
    const newCourse = await (prisma as any).course.create({
      data: {
        title: name,
        mentorId,
        description: `Schedule: ${schedule}`,
        category: 'ONLINE',
        duration: `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      batch: { ...newCourse, currentStudents: 0 }
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      name,
      courseId,
      mentorId,
      schedule,
      maxStudents,
      startDate,
      endDate,
      location,
      deliveryMode,
      isActive
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate max students
    if (maxStudents < 1 || maxStudents > 100) {
      return NextResponse.json(
        { error: 'Max students must be between 1 and 100' },
        { status: 400 }
      );
    }

    const updatedCourse = await (prisma as any).course.update({
      where: { id },
      data: {
        title: name,
        mentorId,
        description: `Schedule: ${schedule}`,
        category: 'ONLINE',
        duration: `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days`,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      batch: { ...updatedCourse, currentStudents: 0 }
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if course has enrollments
    const enrollmentCount = await (prisma as any).enrollment.count({
      where: { courseId: id }
    });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active enrollments' },
        { status: 400 }
      );
    }

    await (prisma as any).course.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
