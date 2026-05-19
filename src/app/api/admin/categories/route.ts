import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      courseCount: cat._count.courses,
      enrollmentCount: 0 // Can be calculated later if needed
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts
    });

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const category = await prisma.category.create({
      data: body
    });

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if slug is being changed and if it conflicts
    if (updateData.slug) {
      const existing = await prisma.category.findFirst({
        where: {
          slug: updateData.slug,
          id: { not: id }
        }
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has courses
    const categoryWithCourses = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    if (!categoryWithCourses) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (categoryWithCourses._count.courses > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with courses. Please delete or reassign courses first.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
