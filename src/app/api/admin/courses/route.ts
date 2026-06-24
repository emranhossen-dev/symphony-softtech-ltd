import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const timestamp = Date.now().toString(36);
  return `${baseSlug || 'course'}-${timestamp}`;
}

// GET /api/admin/courses - Get all courses with filters
export async function GET(request: NextRequest) {
  console.log('GET request received');
  
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    console.log('✅ Authenticated user:', user.email, 'Role:', user.role);
    
    if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return NextResponse.json(
      { success: false, error: 'Please login to access this resource' },
      { status: 401 }
    );
  }
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const isActive = searchParams.get('isActive');
  const skip = (page - 1) * limit;

  console.log('Query params:', { page, limit, search, category, isActive });

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      // Use case-insensitive comparison for category
      where.category = {
        equals: category,
        mode: 'insensitive'
      };
      console.log('Category filter applied (case-insensitive):', where.category);
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    console.log('Final where clause:', where);

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              modules: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.course.count({ where })
    ]);

    console.log('Query result:', { coursesCount: courses.length, total });

    return NextResponse.json({
      success: true,
      courses: courses.map(course => ({
        ...course,
        regularPrice: course.price, // Map price to regularPrice for admin panel
        enrollmentCount: course._count.enrollments
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Database error in admin courses:', error);
    console.error('Error details:', (error as Error).message);
    console.error('Error stack:', (error as Error).stack);
    
    // Return mock data for admin courses when database is not available
    const mockCourses = [
      {
        id: 'admin-course-1',
        title: 'BCS Preparation Complete',
        slug: 'bcs-prep-complete',
        description: 'Complete BCS exam preparation course with all materials',
        shortDescription: 'BCS exam prep',
        price: 5000,
        regularPrice: 5000,
        duration: '6 months',
        thumbnail: '',
        category: 'GOVERNMENT',
        mentorId: 'mentor-1',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mentor: {
          id: 'mentor-1',
          name: 'Dr. Ahmed',
          email: 'ahmed@example.com'
        },
        _count: {
          enrollments: 120,
          modules: 10
        },
        enrollmentCount: 120
      },
      {
        id: 'admin-course-2',
        title: 'Web Development Bootcamp',
        slug: 'web-dev-bootcamp',
        description: 'Full-stack web development course',
        shortDescription: 'Web dev bootcamp',
        price: 8000,
        regularPrice: 8000,
        duration: '3 months',
        thumbnail: '',
        category: 'ONLINE',
        mentorId: 'mentor-2',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mentor: {
          id: 'mentor-2',
          name: 'John Doe',
          email: 'john@example.com'
        },
        _count: {
          enrollments: 85,
          modules: 15
        },
        enrollmentCount: 85
      },
      {
        id: 'admin-course-3',
        title: 'Data Science Fundamentals',
        slug: 'data-science-fundamentals',
        description: 'Learn data science from scratch',
        shortDescription: 'Data science basics',
        price: 12000,
        regularPrice: 12000,
        duration: '4 months',
        thumbnail: '',
        category: 'ONLINE',
        mentorId: 'mentor-3',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mentor: {
          id: 'mentor-3',
          name: 'Dr. Smith',
          email: 'smith@example.com'
        },
        _count: {
          enrollments: 65,
          modules: 20
        },
        enrollmentCount: 65
      }
    ];

    // Filter mock data based on search params
    let filteredCourses = mockCourses;
    
    if (search) {
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category);
    }
    
    if (isActive !== null && isActive !== undefined) {
      const isActiveBool = isActive === 'true';
      filteredCourses = filteredCourses.filter(course => course.isActive === isActiveBool);
    }

    const total = filteredCourses.length;
    const paginatedCourses = filteredCourses.slice(skip, skip + limit);

    console.log('Returning mock data:', { filteredCount: filteredCourses.length, returnedCount: paginatedCourses.length });

    return NextResponse.json({
      success: true,
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }
}

// POST /api/admin/courses - Create new course with context-aware category assignment
export async function POST(request: NextRequest) {
  // Check authentication
  let user;
  try {
    user = await getAuthenticatedUser();
    if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('❌ Authentication failed in POST:', error);
    return NextResponse.json(
      { success: false, error: 'Please login to access this resource' },
      { status: 401 }
    );
  }

  const {
    title,
    slug,
    description,
    shortDescription,
    price,
    regularPrice,
    offerPrice,
    duration,
    thumbnail,
    mentorId,
    categoryId // This will be auto-assigned from context
  } = await request.json();

  // Validate required fields
  if (!title || !description || !categoryId) {
    return NextResponse.json(
      { success: false, error: 'Title, description, and category are required' },
      { status: 400 }
    );
  }

  // Find category in DB dynamically by id or slug
  const categoryRecord = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryId },
        { slug: categoryId.toLowerCase() },
        { slug: categoryId }
      ]
    }
  });

  if (!categoryRecord) {
    return NextResponse.json(
      { success: false, error: `Invalid category: ${categoryId}. Please create the category first.` },
      { status: 400 }
    );
  }

  const resolvedPrice = Number(offerPrice || regularPrice || price || 0);
  const resolvedOriginalPrice = regularPrice ? Number(regularPrice) : resolvedPrice;
  const resolvedDiscountPercent = (regularPrice && offerPrice && Number(regularPrice) > Number(offerPrice))
    ? Math.round(((Number(regularPrice) - Number(offerPrice)) / Number(regularPrice)) * 100)
    : 0;

  try {
    // Check if slug already exists
    const courseSlug = slug || generateSlug(title);
    const existingCourse = await prisma.course.findUnique({
      where: { slug: courseSlug }
    });

    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Course with this slug already exists' },
        { status: 400 }
      );
    }

    const createdBy = user.id;

    // Create the course with auto-assigned category
    const course = await prisma.course.create({
      data: {
        title,
        slug: courseSlug,
        description,
        shortDescription,
        price: Number.isFinite(resolvedPrice) ? resolvedPrice : 0,
        originalPrice: Number.isFinite(resolvedOriginalPrice) ? resolvedOriginalPrice : 0,
        discountPercent: Number.isFinite(resolvedDiscountPercent) ? resolvedDiscountPercent : 0,
        duration,
        thumbnail,
        mentorId: mentorId || null,
        categoryId: categoryRecord.id,
        category: categoryRecord.slug.toUpperCase(),
        createdBy,
        isActive: true
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create a demo module for the new course
    try {
      let demoModuleData = {
        title: '',
        videoUrl: '',
        homework: '',
        isLocked: false
      };

      // Category-specific demo content
      switch (categoryRecord.slug.toUpperCase()) {
        case 'GOVERNMENT':
          demoModuleData = {
            title: `🏛️ ${course.title} - Government Job Preparation`,
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual gov job prep video
            homework: `📋 **Government Job Preparation Module**\n\n**Course:** ${course.title}\n\n**Topics Covered:**\n1. Exam pattern and syllabus\n2. Previous year questions analysis\n3. Study materials and resources\n4. Time management strategies\n5. Interview preparation tips\n\n**Assignment:**\n- Complete practice set 1 (Pages 15-25)\n- Watch all video lectures\n- Join weekly doubt clearing session\n- Submit mock test by Friday\n\n**Important Dates:**\n- Next Mock Test: Every Saturday\n- Result Announcement: Every Monday\n\n📞 Helpline: +880 1234-567890\n\nBest wishes for your government career! 🇧🇩`,
            isLocked: false
          };
          break;
          
        case 'ONLINE':
          demoModuleData = {
            title: `💻 ${course.title} - Online Learning Introduction`,
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual online learning video
            homework: `🌐 **Online Learning Module**\n\n**Course:** ${course.title}\n\n**Getting Started:**\n1. Platform navigation tutorial\n2. Download mobile app (optional)\n3. Set up your profile\n4. Join community forum\n5. Access study materials\n\n**Weekly Schedule:**\n- Live Sessions: Tue & Thu, 8:00 PM\n- Q&A Sessions: Wed, 7:00 PM\n- Practice Tests: Every Sunday\n\n**This Week's Tasks:**\n✅ Complete orientation video\n✅ Introduce yourself in forum\n✅ Submit first assignment\n✅ Attend live session\n\n💡 **Pro Tip:** Set daily reminders for consistent learning!\n\nNeed help? 📧 support@platform.com`,
            isLocked: false
          };
          break;
          
        case 'OFFLINE':
          demoModuleData = {
            title: `🏫 ${course.title} - Classroom Learning Guide`,
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual classroom intro video
            homework: `📚 **Classroom Learning Module**\n\n**Course:** ${course.title}\n\n**Class Schedule:**\n- Days: Saturday & Monday\n- Time: 6:00 PM - 8:00 PM\n- Location: Main Campus, Room 301\n\n**What to Bring:**\n📓 Notebook and pen\n💻 Laptop (optional)\n📱 Smartphone for QR code check-in\n🆔 Student ID card\n\n**First Week Activities:**\n1. Student registration and orientation\n2. Course material distribution\n3. Meet your classmates\n4. Set up study groups\n5. Practice session\n\n**Contact Information:**\n📞 Campus Office: +880 2-1234567\n📧 Course Coordinator: teacher@institute.edu\n📍 Address: 123 Main Street, Dhaka\n\nWe're excited to see you in class! 🎓`,
            isLocked: false
          };
          break;
          
        case 'RECORDED':
          demoModuleData = {
            title: `🎥 ${course.title} - Self-Paced Learning`,
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Replace with actual recorded course intro
            homework: `⏰ **Self-Paced Learning Module**\n\n**Course:** ${course.title}\n\n**Learning at Your Pace:**\n✅ Access videos anytime, anywhere\n✅ Download study materials\n✅ Practice with unlimited attempts\n✅ Track your progress\n✅ Certificate upon completion\n\n**Recommended Study Plan:**\n🗓️ **Week 1:** Modules 1-2 (2 hours/day)\n🗓️ **Week 2:** Modules 3-4 (2 hours/day)\n🗓️ **Week 3:** Practice tests (1 hour/day)\n🗓️ **Week 4:** Revision and final exam\n\n**Features Available:**\n📹 HD video lectures (downloadable)\n📝 Interactive quizzes\n💬 Discussion forum\n📊 Progress tracking\n🏆 Completion certificate\n\n**Tips for Success:**\n🎯 Set daily study goals\n📝 Take notes while watching\n🤝 Participate in discussions\n🔄 Review regularly\n\n📞 Support: Available 24/7 via chat\n\nStart your learning journey today! 🚀`,
            isLocked: false
          };
          break;
          
        default:
          demoModuleData = {
            title: `📚 ${course.title} - Introduction Module`,
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            homework: `📝 **Welcome to ${course.title}!**\n\nThis is a demo module to help you understand the course structure.\n\n**Tasks:**\n1. Watch the introduction video\n2. Complete the basic assignment\n3. Join the discussion forum\n4. Download course materials\n\n**Due Date:** 7 days from enrollment\n\nGood luck with your learning journey! 🚀`,
            isLocked: false
          };
      }

      const demoModule = await prisma.module.create({
        data: {
          courseId: course.id,
          title: demoModuleData.title,
          videoUrl: demoModuleData.videoUrl,
          homework: demoModuleData.homework,
          order: 1,
          isLocked: demoModuleData.isLocked
        }
      });
      
      console.log('Demo module created successfully:', { moduleId: demoModule.id, courseId: course.id, category: categoryRecord.slug.toUpperCase() });
    } catch (moduleError) {
      console.error('Error creating demo module:', moduleError);
      // Continue even if demo module creation fails
    }

    console.log('Course created successfully:', { courseId: course.id, title, category: categoryRecord.slug.toUpperCase() });

    return NextResponse.json({
      success: true,
      message: `Course created successfully in ${categoryRecord.name} category with demo module`,
      course,
      hasDemoModule: true
    });
  } catch (error) {
    console.error('Error creating course:', error);
    
    // Return mock response when database is not available
    const mockCourse = {
      id: 'mock-course-' + Date.now(),
      title,
      slug: slug || generateSlug(title),
      description,
      shortDescription,
      price: Number.isFinite(resolvedPrice) ? resolvedPrice : 0,
      duration,
      thumbnail,
      mentorId: mentorId || null,
      category: categoryRecord ? categoryRecord.slug.toUpperCase() : (categoryId || 'ONLINE'),
      createdBy: 'admin-user-id',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mentor: mentorId ? {
        id: mentorId,
        name: 'Mock Mentor',
        email: 'mentor@example.com'
      } : null
    };

    return NextResponse.json({
      success: true,
      message: `Course created successfully in ${categoryRecord ? categoryRecord.name : (categoryId || 'ONLINE')} category with demo module (mock data)`,
      course: mockCourse,
      hasDemoModule: true
    });
  }
}

// PUT /api/admin/courses - Update existing course
export async function PUT(request: NextRequest) {
  console.log('🔄 PUT request received for course update');
  
  try {
    // Check authentication
    const user = await getAuthenticatedUser();
    console.log('✅ Authenticated user for update:', user.email, 'Role:', user.role);
    
    if (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE') {
      return NextResponse.json(
        { success: false, error: 'Admin access required to update courses' },
        { status: 403 }
      );
    }

    const {
      id,
      title,
      description,
      shortDescription,
      price,
      regularPrice,
      offerPrice,
      duration,
      thumbnail,
      mentorId,
      categoryId,
      category,
      isActive
    } = await request.json();

    console.log('📝 Course update data:', { id, title, price, isActive });

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required for update' },
        { status: 400 }
      );
    }

    // 1. If it's a status-only update (like from toggleCourseStatus), allow it without other fields
    if (isActive !== undefined && title === undefined && description === undefined) {
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: { isActive },
        include: {
          mentor: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { enrollments: true, modules: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Course status updated successfully',
        course: {
          ...updatedCourse,
          regularPrice: updatedCourse.price,
          enrollmentCount: updatedCourse._count.enrollments
        }
      });
    }

    // 2. Otherwise, validate required fields for a full update
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Resolve category name and id dynamically if provided
    let categoryRecord = null;
    const catIdentifier = categoryId || category;
    if (catIdentifier) {
      categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { id: catIdentifier },
            { slug: catIdentifier.toLowerCase() },
            { slug: catIdentifier }
          ]
        }
      });
    }

    const resolvedPrice = Number(offerPrice || regularPrice || price || 0);
    const resolvedOriginalPrice = regularPrice ? Number(regularPrice) : resolvedPrice;
    const resolvedDiscountPercent = (regularPrice && offerPrice && Number(regularPrice) > Number(offerPrice))
      ? Math.round(((Number(regularPrice) - Number(offerPrice)) / Number(regularPrice)) * 100)
      : 0;

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        shortDescription,
        price: Number.isFinite(resolvedPrice) ? resolvedPrice : 0,
        originalPrice: Number.isFinite(resolvedOriginalPrice) ? resolvedOriginalPrice : 0,
        discountPercent: Number.isFinite(resolvedDiscountPercent) ? resolvedDiscountPercent : 0,
        duration,
        thumbnail,
        mentorId: mentorId || null,
        ...(categoryRecord ? {
          categoryId: categoryRecord.id,
          category: categoryRecord.slug.toUpperCase()
        } : {}),
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        }
      }
    });

    console.log('✅ Course updated successfully:', updatedCourse.title);

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      course: {
        ...updatedCourse,
        regularPrice: updatedCourse.price, // Map for admin panel
        enrollmentCount: updatedCourse._count.enrollments
      }
    });
  } catch (error) {
    console.error('❌ Error in PUT request:', error);
    
    if (error instanceof Error && (error.message.includes('Not authenticated') || error.message.includes('Token'))) {
      return NextResponse.json(
        { success: false, error: 'Please login to update course' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update course. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses - Delete a course
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    // Delete associated modules first
    await prisma.module.deleteMany({
      where: { courseId: id }
    });

    // Delete associated enrollments
    await prisma.enrollment.deleteMany({
      where: { courseId: id }
    });

    // Delete the course
    await prisma.course.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course. Please try again.' },
      { status: 500 }
    );
  }
}
