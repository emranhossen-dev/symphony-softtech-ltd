import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hasRole } from '@/lib/auth';

// PATCH /api/admin/calls/[id] - Update a call record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
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
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
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
