import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch testimonials'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      order
    } = body;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        content,
        rating: rating || 5,
        avatar,
        company,
        location,
        course,
        image,
        graduationYear,
        achievement,
        order: order || 0
      }
    });

    return NextResponse.json({
      success: true,
      testimonial
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create testimonial'
      },
      { status: 500 }
    );
  }
}
