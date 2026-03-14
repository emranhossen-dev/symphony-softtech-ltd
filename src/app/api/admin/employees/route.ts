import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
