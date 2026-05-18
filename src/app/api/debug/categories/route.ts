import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Fetching categories...');
    
    const categories = await prisma.category.findMany();

    console.log(`Debug: Found ${categories.length} categories`);

    return NextResponse.json({
      success: true,
      totalCategories: categories.length,
      categories
    });

  } catch (error) {
    console.error('Debug: Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
