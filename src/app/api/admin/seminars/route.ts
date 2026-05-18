import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// GET - Fetch all seminars
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    const seminars = await prisma.seminar.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        registrations: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Transform data to match expected format
    const transformedSeminars = seminars.map(seminar => ({
      ...seminar,
      currentRegistrations: seminar.registrations.filter(r => r.status === 'CONFIRMED').length,
      registrations: undefined // Remove detailed registrations array
    }));

    return NextResponse.json({
      success: true,
      data: transformedSeminars
    });
  } catch (error) {
    console.error('Error fetching seminars:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch seminars'
    }, { status: 500 });
  }
}

// POST - Create new seminar
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    let user;
    try {
      user = await getAuthenticatedUser();
      console.log('Authenticated user:', user);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }
    
    const body = await request.json();
    console.log('Received seminar data:', body);
    
    const {
      title,
      description,
      date,
      time,
      location,
      maxParticipants,
      imageUrl,
      registrationUrl,
      status = 'upcoming'
    } = body;

    // Validation
    if (!title || !description || !date || !time || !location || !maxParticipants) {
      console.log('Validation failed - missing fields:', { title, description, date, time, location, maxParticipants });
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Generate slug from title if registrationUrl not provided
    const slug = registrationUrl || 
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/seminar-registration/${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}`;

    const seminarData = {
      title,
      description,
      date: new Date(date),
      time,
      location,
      maxParticipants: parseInt(maxParticipants),
      imageUrl,
      registrationUrl: slug,
      status: status.toUpperCase(),
      createdBy: user.id
    };
    
    console.log('Creating seminar with data:', seminarData);
    
    const seminar = await prisma.seminar.create({
      data: seminarData
    });
    
    console.log('Seminar created successfully:', seminar);

    return NextResponse.json({
      success: true,
      data: seminar
    });
  } catch (error) {
    console.error('Error creating seminar:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create seminar'
    }, { status: 500 });
  }
}
