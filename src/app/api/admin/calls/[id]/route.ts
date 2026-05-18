import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/lib/auth';

// PATCH /api/admin/calls/[id] - Update a call record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!hasRole(user.role, 'ADMIN') && !hasRole(user.role, 'EMPLOYEE')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const callRecord = await prisma.callRecord.update({
      where: { id },
      data: body,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: callRecord
    });

  } catch (error) {
    console.error('Error updating call record:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update call record'
    }, { status: 500 });
  }
}

// DELETE /api/admin/calls/[id] - Delete a call record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!hasRole(user.role, 'ADMIN') && !hasRole(user.role, 'EMPLOYEE')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.callRecord.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Call record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting call record:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete call record'
    }, { status: 500 });
  }
}
