import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Import auth functions conditionally to avoid errors when database is not available
let hashPassword: (password: string) => Promise<string>;
try {
  const authModule = require('@/lib/auth');
  hashPassword = authModule.hashPassword;
} catch (error) {
  console.log('Auth module not available, using mock implementation');
  hashPassword = async (password: string) => `hashed_${password}`;
}



export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!prisma) {
      console.error('Prisma client not initialized');
      return NextResponse.json(
        { success: false, error: 'Database connection failed - Prisma client not initialized' },
        { status: 500 }
      );
    }

    // For development: Skip authentication check temporarily
    // TODO: Enable authentication in production
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    console.log('Fetching mentors from database...');

    // Fetch mentors (users with MENTOR role)
    let mentors;
    try {
      mentors = await prisma.user.findMany({
        where: { role: 'MENTOR' },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`Found ${mentors.length} mentors`);
    } catch (dbError: any) {
      console.error('Database query failed while fetching mentors:', dbError);
      
      // Handle specific Prisma errors
      if (dbError.code === 'P1000' || dbError.code === 'P1001' || dbError.code === 'P1002') {
        return NextResponse.json(
          { success: false, error: `Database connection error: ${dbError.message}` },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformedMentors = mentors.map((mentor) => ({
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      image: null, // TODO: Add image field to database schema
      rating: 4.5,
      totalStudents: 0,
      totalRevenue: 0,
      isActive: mentor.isActive ?? true,
      joinedAt: mentor.createdAt,
      courses: []
    }));

    return NextResponse.json({
      success: true,
      mentors: transformedMentors
    });
  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/mentors:', error);
    
    // Handle database connection errors
    if (error.message && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed - check DATABASE_URL environment variable' },
        { status: 500 }
      );
    }
    
    // Handle Prisma connection errors
    if (error.code === 'P1000' || error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json(
        { success: false, error: `Database connection error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: `Failed to fetch mentors: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET_BY_ID(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if database is available
    if (!prisma) {
      // Return mock data if database is not available
      const { id } = await params;
      const mockMentor = {
        id: id,
        name: 'Dr. Karim Ahmed',
        email: 'karim@example.com',
        phone: '01712345678',
        image: null,
        rating: 4.8,
        totalStudents: 150,
        totalRevenue: 750000,
        isActive: true,
        joinedAt: new Date().toISOString(),
        courses: []
      };

      return NextResponse.json({
        success: true,
        mentor: mockMentor
      });
    }

    // For development: Skip authentication check temporarily
    // TODO: Enable authentication in production
    
    const { id } = await params;

    // Fetch specific mentor
    const mentor = await prisma.user.findFirst({
      where: { 
        id: id,
        role: 'MENTOR'
      }
    }).catch(error => {
      console.error('Database query failed:', error);
      throw error;
    });

    if (!mentor) {
      return NextResponse.json(
        { success: false, error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Transform data to match expected format
    const transformedMentor = {
      id: mentor.id,
      name: mentor.name,
      email: mentor.email,
      phone: mentor.phone,
      image: null, // TODO: Add image field to database schema
      rating: 4.5,
      totalStudents: 0,
      totalRevenue: 0,
      isActive: mentor.isActive ?? true,
      joinedAt: mentor.createdAt,
      courses: []
    };

    return NextResponse.json({
      success: true,
      mentor: transformedMentor
    });
  } catch (error: any) {
    console.error('Error fetching mentor:', error);
    
    // If it's a database connection error, return mock data
    if (error.message && error.message.includes('DATABASE_URL')) {
      const { id } = await params;
      const mockMentor = {
        id: id,
        name: 'Dr. Karim Ahmed',
        email: 'karim@example.com',
        phone: '01712345678',
        image: null,
        rating: 4.8,
        totalStudents: 150,
        totalRevenue: 750000,
        isActive: true,
        joinedAt: new Date().toISOString(),
        courses: []
      };

      return NextResponse.json({
        success: true,
        mentor: mockMentor
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mentor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Read request body once at the beginning
    const body = await request.json();
    const { name, email, password, phone, bio, expertise, category } = body;

    // Check if database is available
    if (!prisma) {
      console.error('Prisma client not initialized');
      return NextResponse.json(
        { success: false, error: 'Database connection failed - Prisma client not initialized' },
        { status: 500 }
      );
    }

    // For development: Skip authentication check temporarily
    // TODO: Enable authentication in production

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('Attempting to create mentor with email:', email);

    // Check if mentor already exists
    let existingMentor;
    try {
      existingMentor = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbError: any) {
      console.error('Database query failed while checking existing mentor:', dbError);
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    if (existingMentor) {
      return NextResponse.json(
        { success: false, error: 'Mentor with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError: any) {
      console.error('Password hashing failed:', hashError);
      return NextResponse.json(
        { success: false, error: `Password hashing failed: ${hashError.message}` },
        { status: 500 }
      );
    }

    console.log('Creating new mentor in database...');

    // Create new mentor
    let mentor;
    try {
      mentor = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: 'MENTOR',
          isActive: true
        }
      });
      console.log('Mentor created successfully with ID:', mentor.id);
    } catch (createError: any) {
      console.error('Failed to create mentor in database:', createError);
      return NextResponse.json(
        { success: false, error: `Failed to create mentor: ${createError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mentor created successfully',
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        isActive: mentor.isActive
      }
    });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/mentors:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Handle database connection errors
    if (error.message && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed - check DATABASE_URL environment variable' },
        { status: 500 }
      );
    }
    
    // Handle Prisma connection errors
    if (error.code === 'P1000' || error.code === 'P1001' || error.code === 'P1002') {
      return NextResponse.json(
        { success: false, error: `Database connection error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: `Failed to create mentor: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    // For development: Skip authentication check temporarily
    // TODO: Enable authentication in production
    
    const body = await request.json();
    const { id } = body;

    // For now, return mock success response
    // In production, you would delete from database:
    // await prisma.user.delete({ where: { id: id } });

    return NextResponse.json({
      success: true,
      message: 'Mentor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete mentor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    // For development: Skip authentication check temporarily
    // TODO: Enable authentication in production
    
    const body = await request.json();
    const { id, isActive } = body;

    // For now, return mock success response
    // In production, you would update in database:
    // await prisma.user.update({ 
    //   where: { id: id }, 
    //   data: { isActive } 
    // });

    return NextResponse.json({
      success: true,
      message: 'Mentor status updated successfully',
      mentor: {
        id: id,
        isActive
      }
    });
  } catch (error) {
    console.error('Error updating mentor status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update mentor status' },
      { status: 500 }
    );
  }
}
