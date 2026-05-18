import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hasRole } from '@/lib/auth';

// GET single mentor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;

    // Check if database is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const mentor = await prisma.user.findFirst({
      where: {
        id: id,
        role: 'MENTOR'
      }
    });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Get mentor's courses separately
    const mentorCourses = await prisma.course.findMany({
      where: {
        mentorId: id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    // Transform the response to match expected format
    const mentorResponse = {
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      image: null, // TODO: Add image field to database schema
      rating: 4.5, // TODO: Add rating field to database schema
      totalStudents: mentorCourses.reduce((sum: number, course: any) => sum + (course._count?.enrollments || 0), 0),
      totalRevenue: 0, // TODO: Calculate from payments
      isActive: mentor.isActive,
      joinedAt: mentor.createdAt,
      courses: mentorCourses.map((course: any) => ({
        id: course.id,
        title: course.title,
        students: course._count?.enrollments || 0
      }))
    };

    return NextResponse.json({
      success: true,
      mentor: mentorResponse
    });
  } catch (error: any) {
    console.error('Error fetching mentor:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch mentor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const body = await request.json();
    const { name, email, phone } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Update mentor in database
    const updatedMentor = await prisma.user.update({
      where: { 
        id: id,
        role: 'MENTOR'
      }, 
      data: { name, email, phone }
    });

    return NextResponse.json({
      success: true,
      message: 'Mentor updated successfully',
      mentor: {
        id: updatedMentor.id,
        name: updatedMentor.name,
        email: updatedMentor.email,
        phone: updatedMentor.phone,
        isActive: updatedMentor.isActive
      }
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json(
      { error: 'Failed to update mentor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    if (!hasRole(payload.role, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const { id } = await params;

    // Check if mentor exists
    const mentor = await prisma.user.findFirst({
      where: { 
        id: id,
        role: 'MENTOR'
      }
    });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Delete mentor
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Mentor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json(
      { error: 'Failed to delete mentor' },
      { status: 500 }
    );
  }
}
