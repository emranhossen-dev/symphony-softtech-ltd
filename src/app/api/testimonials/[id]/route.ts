import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check - only admins can update testimonials
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      role,
      content,
      rating,
      avatar,
      company,
      location,
      course,
      image,
      graduationYear,
      achievement,
      isActive,
      order
    } = body;

    const testimonial = await prisma.testimonial.update({
      where: {
        id
      },
      data: {
        name,
        role,
        content,
        rating,
        avatar,
        company,
        location,
        course,
        image,
        graduationYear,
        achievement,
        isActive,
        order
      }
    });

    return NextResponse.json({
      success: true,
      testimonial
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update testimonial'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check - only admins can delete testimonials
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.testimonial.delete({
      where: {
        id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete testimonial'
      },
      { status: 500 }
    );
  }
}
