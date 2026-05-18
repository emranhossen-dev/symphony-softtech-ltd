import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const registrations = await prisma.seminarRegistration.findMany({
      where: {
        seminarId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch registrations'
    }, { status: 500 });
  }
}
