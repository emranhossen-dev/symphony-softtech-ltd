import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find seminar by slug (extracted from registration URL)
    const seminar = await prisma.seminar.findFirst({
      where: {
        registrationUrl: {
          contains: slug
        }
      },
      include: {
        registrations: {
          where: {
            status: 'CONFIRMED'
          },
          select: {
            id: true
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

    // Transform data for public view
    const publicSeminar = {
      id: seminar.id,
      title: seminar.title,
      description: seminar.description,
      date: seminar.date,
      time: seminar.time,
      location: seminar.location,
      maxParticipants: seminar.maxParticipants,
      currentRegistrations: seminar.registrations.length,
      status: seminar.status,
      imageUrl: seminar.imageUrl,
      registrationUrl: seminar.registrationUrl
    };

    return NextResponse.json({
      success: true,
      data: publicSeminar
    });
  } catch (error) {
    console.error('Error fetching seminar:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch seminar'
    }, { status: 500 });
  }
}
