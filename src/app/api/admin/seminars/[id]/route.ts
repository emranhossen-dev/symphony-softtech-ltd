import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Fetch single seminar
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    let user;
    try {
      user = await getAuthenticatedUser();
      console.log('Authenticated user for fetch:', user);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { id } = await params;

    // Fetch seminar with details
    const seminar = await prisma.seminar.findUnique({
      where: { id },
      include: {
        registrations: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    if (!seminar) {
      return NextResponse.json({
        success: false,
        error: 'Seminar not found'
      }, { status: 404 });
    }

    // Transform data to match expected format
    const transformedSeminar = {
      ...seminar,
      currentRegistrations: seminar.registrations.filter(r => r.status === 'CONFIRMED').length,
      registrations: undefined // Remove detailed registrations array
    };

    console.log('Seminar fetched successfully:', transformedSeminar);

    return NextResponse.json({
      success: true,
      data: transformedSeminar
    });

  } catch (error) {
    console.error('Error fetching seminar:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch seminar'
    }, { status: 500 });
  }
}

// PUT - Update a seminar
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    let user;
    try {
      user = await getAuthenticatedUser();
      console.log('Authenticated user for update:', user);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      description,
      date,
      time,
      location,
      maxParticipants,
      imageUrl,
      registrationUrl,
      status
    } = body;

    // Validation
    if (!title || !description || !date || !time || !location || !maxParticipants) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check if seminar exists
    const existingSeminar = await prisma.seminar.findUnique({
      where: { id }
    });

    if (!existingSeminar) {
      return NextResponse.json({
        success: false,
        error: 'Seminar not found'
      }, { status: 404 });
    }

    // Update seminar
    const seminar = await prisma.seminar.update({
      where: { id },
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        maxParticipants: parseInt(maxParticipants),
        imageUrl,
        registrationUrl,
        status: status.toUpperCase(),
      }
    });

    console.log('Seminar updated successfully:', seminar);

    return NextResponse.json({
      success: true,
      data: seminar
    });

  } catch (error) {
    console.error('Error updating seminar:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update seminar'
    }, { status: 500 });
  }
}

// DELETE - Delete a seminar
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    let user;
    try {
      user = await getAuthenticatedUser();
      console.log('Authenticated user for delete:', user);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { id } = await params;

    // Check if seminar exists
    const seminar = await prisma.seminar.findUnique({
      where: { id },
      include: {
        registrations: true
      }
    });

    if (!seminar) {
      return NextResponse.json({
        success: false,
        error: 'Seminar not found'
      }, { status: 404 });
    }

    // Check if seminar has registrations
    if (seminar.registrations.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete seminar with existing registrations'
      }, { status: 400 });
    }

    // Delete the seminar
    await prisma.seminar.delete({
      where: { id }
    });

    console.log('Seminar deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Seminar deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting seminar:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete seminar'
    }, { status: 500 });
  }
}
