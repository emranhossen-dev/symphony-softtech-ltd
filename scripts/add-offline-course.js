const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addOfflineCourse() {
  try {
    console.log('🔍 Checking for existing offline courses...');
    
    // Check if offline courses exist
    const existingOfflineCourses = await prisma.course.findMany({
      where: {
        category: 'OFFLINE'
      }
    });

    if (existingOfflineCourses.length > 0) {
      console.log(`✅ Found ${existingOfflineCourses.length} offline courses already exist`);
      existingOfflineCourses.forEach(course => {
        console.log(`   - ${course.title} (ID: ${course.id})`);
      });
      return;
    }

    console.log('❌ No offline courses found. Adding sample offline course...');

    // Find a user to be the creator
    let creatorId = 'admin-user-id';
    try {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      if (adminUser) {
        creatorId = adminUser.id;
      } else {
        const mentorUser = await prisma.user.findFirst({
          where: { role: 'MENTOR' }
        });
        
        if (mentorUser) {
          creatorId = mentorUser.id;
        }
      }
    } catch (error) {
      console.log('Using mock creator ID');
    }

    // Create sample offline courses
    const offlineCourses = [
      {
        title: 'Classroom Full Stack Development',
        slug: 'classroom-full-stack-' + Date.now(),
        description: 'Comprehensive full-stack web development course with in-person classes. Learn HTML, CSS, JavaScript, React, Node.js, and more through hands-on classroom training.',
        shortDescription: 'In-person full-stack training',
        price: 15000,
        duration: '3 months',
        thumbnail: '',
        category: 'OFFLINE',
        mentorId: null,
        createdBy: creatorId,
        isActive: true,
        featured: true
      },
      {
        title: 'Classroom Python Programming',
        slug: 'classroom-python-' + Date.now() + 1,
        description: 'Learn Python programming through interactive classroom sessions. Perfect for beginners who want personalized attention and hands-on learning.',
        shortDescription: 'In-person Python basics',
        price: 12000,
        duration: '2 months',
        thumbnail: '',
        category: 'OFFLINE',
        mentorId: null,
        createdBy: creatorId,
        isActive: true,
        featured: true
      }
    ];

    for (const courseData of offlineCourses) {
      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          shortDescription: courseData.shortDescription,
          price: courseData.price,
          duration: courseData.duration,
          thumbnail: courseData.thumbnail,
          category: courseData.category,
          mentorId: courseData.mentorId,
          createdBy: courseData.createdBy,
          isActive: courseData.isActive,
          featured: courseData.featured,
          rating: courseData.rating,
          reviewCount: courseData.reviewCount,
          enrollmentCount: courseData.enrollmentCount
        }
      });

      console.log(`✅ Created offline course: ${course.title} (ID: ${course.id})`);

      // Create a demo module for each course
      const demoModule = await prisma.module.create({
        data: {
          courseId: course.id,
          title: `🏫 ${course.title} - Classroom Introduction`,
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          homework: `📚 **Classroom Learning Module**\n\n**Course:** ${course.title}\n\n**Class Schedule:**\n- Days: Saturday & Monday\n- Time: 6:00 PM - 8:00 PM\n- Location: Main Campus, Room 301\n\n**What to Bring:**\n📓 Notebook and pen\n💻 Laptop (optional)\n📱 Smartphone for QR code check-in\n🆔 Student ID card\n\n**First Week Activities:**\n1. Student registration and orientation\n2. Course material distribution\n3. Meet your classmates\n4. Set up study groups\n5. Practice session\n\nWe're excited to see you in class! 🎓`,
          order: 1,
          isLocked: false
        }
      });

      console.log(`   📝 Created demo module: ${demoModule.title}`);
    }

    console.log('🎉 Offline courses added successfully! The OFFLINE tab should now appear in the category toggler.');

  } catch (error) {
    console.error('❌ Error adding offline courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addOfflineCourse();
