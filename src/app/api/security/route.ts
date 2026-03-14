import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, withValidation, userSchema, courseSchema, enrollmentSchema, paymentSchema, homeworkSchema, liveClassSchema } from '@/lib/security';
import bcrypt from 'bcryptjs';

// Apply security middleware to all routes
export function withApiSecurity(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Apply security headers and rate limiting
      const secureHandler = withSecurity(handler);
      
      // Call the original handler
      return await secureHandler(request, ...args);
    } catch (error) {
      console.error('API security middleware error:', error);
      return NextResponse.json(
        { error: 'Security middleware failed' },
        { status: 500 }
      );
    }
  };
}

// User registration with validation
export const registerUser = withApiSecurity(
  withValidation(userSchema)(async (request: NextRequest) => {
    try {
      const { email, password, firstName, lastName, role } = (request as any).validatedBody;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user (in real app, save to database)
      const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isActive: newUser.isActive
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('User registration error:', error);
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }
  })
);

// User login with validation
export const loginUser = withApiSecurity(
  withValidation(userSchema.omit({ role: true }))(async (request: NextRequest) => {
    try {
      const { email, password } = (request as any).validatedBody;
      
      // Verify credentials (in real app, check against database)
      const { verifyPassword } = await import('@/lib/security');
      
      // Mock user data for demo
      const mockUser = {
        id: '1',
        email: 'admin@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true
      };
      
      const isValid = await verifyPassword(password, mockUser.password);
      
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const { generateSecureToken } = await import('@/lib/security');
      const token = generateSecureToken({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 500 }
      );
    }
  })
);

// Course creation with validation
export const createCourse = withApiSecurity(
  withValidation(courseSchema)(async (request: NextRequest) => {
    try {
      const { name, description, category, price, duration } = (request as any).validatedBody;
      
      // Create course (in real app, save to database)
      const newCourse = {
        id: Date.now().toString(),
        name,
        description,
        category,
        price,
        duration,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        course: newCourse,
        message: 'Course created successfully'
      });
    } catch (error) {
      console.error('Course creation error:', error);
      return NextResponse.json(
        { error: 'Course creation failed' },
        { status: 500 }
      );
    }
  })
);

// Enrollment management with validation
export const createEnrollment = withApiSecurity(
  withValidation(enrollmentSchema)(async (request: NextRequest) => {
    try {
      const { courseId, studentId, enrollmentStatus } = (request as any).validatedBody;
      
      // Create enrollment (in real app, save to database)
      const newEnrollment = {
        id: Date.now().toString(),
        courseId,
        studentId,
        enrollmentStatus,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        enrollment: newEnrollment,
        message: 'Enrollment created successfully'
      });
    } catch (error) {
      console.error('Enrollment creation error:', error);
      return NextResponse.json(
        { error: 'Enrollment creation failed' },
        { status: 500 }
      );
    }
  })
);

// Payment processing with validation
export const processPayment = withApiSecurity(
  withValidation(paymentSchema)(async (request: NextRequest) => {
    try {
      const { amount, paymentMethod, enrollmentId, status } = (request as any).validatedBody;
      
      // Process payment (in real app, integrate with payment gateway)
      const payment = {
        id: Date.now().toString(),
        amount,
        paymentMethod,
        enrollmentId,
        status,
        transactionId: `txn_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        payment,
        message: 'Payment processed successfully'
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      return NextResponse.json(
        { error: 'Payment processing failed' },
        { status: 500 }
      );
    }
  })
);

// Homework submission with validation
export const submitHomework = withApiSecurity(
  withValidation(homeworkSchema)(async (request: NextRequest) => {
    try {
      const { title, description, courseId, dueDate, maxScore } = (request as any).validatedBody;
      
      // Submit homework (in real app, save to database)
      const homework = {
        id: Date.now().toString(),
        title,
        description,
        courseId,
        dueDate,
        maxScore,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        homework,
        message: 'Homework submitted successfully'
      });
    } catch (error) {
      console.error('Homework submission error:', error);
      return NextResponse.json(
        { error: 'Homework submission failed' },
        { status: 500 }
      );
    }
  })
);

// Live class creation with validation
export const createLiveClass = withApiSecurity(
  withValidation(liveClassSchema)(async (request: NextRequest) => {
    try {
      const { title, description, courseId, scheduledAt, duration, maxParticipants } = (request as any).validatedBody;
      
      // Create live class (in real app, save to database)
      const liveClass = {
        id: Date.now().toString(),
        title,
        description,
        courseId,
        scheduledAt,
        duration,
        maxParticipants,
        status: 'SCHEDULED',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        liveClass,
        message: 'Live class created successfully'
      });
    } catch (error) {
      console.error('Live class creation error:', error);
      return NextResponse.json(
        { error: 'Live class creation failed' },
        { status: 500 }
      );
    }
  })
);

// File upload handler with security
export const handleFileUpload = withApiSecurity(async (request: NextRequest) => {
  try {
    const contentType = request.headers.get('content-type');
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type for file upload' },
        { status: 400 }
      );
    }

    // Handle file upload (in real app, save to cloud storage)
    const file = (request as any).file;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const { validateFileUpload } = await import('@/lib/security');
    const validation = validateFileUpload(file);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process file upload
    const fileUrl = `/uploads/${file.name}`;
    
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    );
  }
});

// GET /api/security - Health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Security API is operational',
    timestamp: new Date().toISOString()
  });
}

// POST /api/security - Handle security operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'register':
        return await registerUser(request);
      case 'login':
        return await loginUser(request);
      case 'createCourse':
        return await createCourse(request);
      case 'createEnrollment':
        return await createEnrollment(request);
      case 'processPayment':
        return await processPayment(request);
      case 'submitHomework':
        return await submitHomework(request);
      case 'createLiveClass':
        return await createLiveClass(request);
      case 'uploadFile':
        return await handleFileUpload(request);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
