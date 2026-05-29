import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      fullName,
      email,
      phone,
      education,
      whyJoin,
      experience
    } = body;

    // Validation
    if (!fullName || !email || !phone || !education || !whyJoin || !experience) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Check if seminar exists and is open for registration
    const seminar = await prisma.seminar.findUnique({
      where: { id },
      include: {
        registrations: {
          where: { status: 'CONFIRMED' },
          select: { id: true }
        }
      }
    });

    if (!seminar) {
      return NextResponse.json({
        success: false,
        error: 'Seminar not found'
      }, { status: 404 });
    }

    if (seminar.status !== 'UPCOMING' && seminar.status !== 'ONGOING') {
      return NextResponse.json({
        success: false,
        error: 'This seminar is not open for registration'
      }, { status: 400 });
    }

    if (seminar.registrations.length >= seminar.maxParticipants) {
      return NextResponse.json({
        success: false,
        error: 'This seminar is already full'
      }, { status: 400 });
    }

    // Check if user already registered
    const existingRegistration = await prisma.seminarRegistration.findFirst({
      where: {
        seminarId: id,
        email: email
      }
    });

    if (existingRegistration) {
      return NextResponse.json({
        success: false,
        error: 'You have already registered for this seminar'
      }, { status: 400 });
    }

    // Create registration
    const registration = await prisma.seminarRegistration.create({
      data: {
        seminarId: id,
        fullName,
        email,
        phone,
        education,
        whyJoin,
        experience,
        status: 'CONFIRMED'
      }
    });

    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        seminarTitle: seminar.title,
        seminarDate: seminar.date,
        seminarTime: seminar.time,
        seminarLocation: seminar.location
      }
    });

  } catch (error) {
    console.error('Error registering for seminar:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register for seminar'
    }, { status: 500 });
  }
}
