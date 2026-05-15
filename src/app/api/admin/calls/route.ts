import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hasRole } from '@/lib/auth';

// GET /api/admin/calls - Get all call records
export async function GET(request: NextRequest) {
  try {
    // Try both Authorization header and cookie
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth_token')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    
    const token = authHeader || cookieToken || authToken;
    
    if (!token) {
      console.log('No token found in calls API');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN') && !hasRole(payload.role, 'EMPLOYEE')) {
      console.log('Insufficient permissions for role:', payload.role);
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // incoming, outgoing
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (search) {
      where.OR = [
        { callerName: { contains: search, mode: 'insensitive' } },
        { calleeName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch call records from database
    const [calls, total] = await Promise.all([
      prisma.callRecord.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.callRecord.count({ where })
    ]);

    // Calculate stats
    const stats = {
      totalCalls: total,
      incomingCalls: await prisma.callRecord.count({ where: { type: 'incoming' } }),
      outgoingCalls: await prisma.callRecord.count({ where: { type: 'outgoing' } }),
      totalDuration: calls.reduce((sum: number, call: any) => sum + (call.duration || 0), 0),
      totalCost: calls.reduce((sum: number, call: any) => sum + (call.cost || 0), 0),
      totalRevenue: calls.reduce((sum: number, call: any) => sum + (call.revenue || 0), 0)
    };

    return NextResponse.json({
      success: true,
      data: calls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching calls:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch call records'
    }, { status: 500 });
  }
}

// POST /api/admin/calls - Create a new call record
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth_token')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    
    const token = authHeader || cookieToken || authToken;
    
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

    const body = await request.json();
    const {
      type,
      status,
      callerName,
      calleeName,
      phoneNumber,
      duration = 0,
      recordingUrl,
      transcript,
      notes,
      cost = 0,
      revenue = 0
    } = body;

    // Validate required fields
    if (!type || !callerName || !calleeName || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const callRecord = await prisma.callRecord.create({
      data: {
        type,
        status: status || 'completed',
        callerName,
        calleeName,
        phoneNumber,
        duration,
        recordingUrl,
        transcript,
        notes,
        cost,
        revenue,
        userId: payload.id
      },
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
    console.error('Error creating call record:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create call record'
    }, { status: 500 });
  }
}
