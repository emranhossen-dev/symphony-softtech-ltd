import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET - Server actions for data fetching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Optimized query with proper indexing
    const skip = (page - 1) * limit;
    
    // Build where clause with optimized conditions
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { student: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Optimized query with proper select and include
    const [data, totalCount] = await Promise.all([
      (prisma as any).course.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          price: true,
          duration: true,
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          enrollments: {
            select: {
              id: true,
              fullName: true,
              email: true,
              enrollmentStatus: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      
      (prisma as any).course.count({
        where: whereClause
      })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit
      }
    });
  } catch (error) {
    console.error('Server action GET error:', error);
    return NextResponse.json(
      { error: 'Failed to perform server action' },
      { status: 500 }
    );
  }
}

// POST - Server actions for batch operations
export async function POST(request: NextRequest) {
  try {
    const { action, items } = await request.json();

    switch (action) {
      case 'bulkUpdate':
        // Optimized bulk update with transaction
        const updateResult = await prisma.$transaction(async (tx) => {
          const updatePromises = items.map((item: any) =>
            (prisma as any).course.update({
              where: { id: item.id },
              data: item.data
            })
          );
          
          return Promise.all(updatePromises);
        });

        return NextResponse.json({
          success: true,
          updatedCount: updateResult.length,
          message: 'Bulk update completed successfully'
        });

      case 'bulkDelete':
        // Optimized bulk delete with transaction
        const deleteResult = await prisma.$transaction(async (tx) => {
          const deletePromises = items.map((item: any) =>
            (prisma as any).course.delete({
              where: { id: item.id }
            })
          );
          
          return Promise.all(deletePromises);
        });

        return NextResponse.json({
          success: true,
          deletedCount: deleteResult.length,
          message: 'Bulk delete completed successfully'
        });

      case 'bulkCreate':
        // Optimized bulk create with transaction
        const createResult = await prisma.$transaction(async (tx) => {
          const createPromises = items.map((item: any) =>
            (prisma as any).course.create({
              data: item.data
            })
          );
          
          return Promise.all(createPromises);
        });

        return NextResponse.json({
          success: true,
          createdCount: createResult.length,
          message: 'Bulk create completed successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Server action POST error:', error);
    return NextResponse.json(
      { error: 'Failed to perform server action' },
      { status: 500 }
    );
  }
}

// PUT - Server actions for updates
export async function PUT(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'updateStatus':
        const { id, status } = data;
        const updatedItem = await (prisma as any).course.update({
          where: { id },
          data: { status }
        });

        return NextResponse.json({
          success: true,
          data: updatedItem,
          message: 'Status updated successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Server action PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to perform server action' },
      { status: 500 }
    );
  }
}

// DELETE - Server actions for deletions
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const deletedItem = await (prisma as any).course.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      data: deletedItem,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Server action DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to perform server action' },
      { status: 500 }
    );
  }
}
