import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
