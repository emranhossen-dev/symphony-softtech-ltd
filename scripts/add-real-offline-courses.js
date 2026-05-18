const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addRealOfflineCourses() {
  try {
    console.log('🔍 Adding real offline courses...');

    // Find the offline courses category
    const offlineCategory = await prisma.category.findUnique({
      where: { slug: 'offline-courses' }
    });

    if (!offlineCategory) {
      console.error('❌ Offline courses category not found');
      return;
    }

    console.log(`✅ Found offline category: ${offlineCategory.name}`);

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

    // Create real offline courses
    const offlineCourses = [
      {
        title: 'Advanced Web Development Bootcamp',
        slug: 'advanced-web-dev-bootcamp-offline',
        description: 'Intensive classroom-based web development program covering HTML, CSS, JavaScript, React, Node.js, and modern web technologies. Perfect for students who prefer hands-on learning with direct instructor interaction.',
        shortDescription: 'Classroom-based full-stack web development',
        price: 25000,
        duration: '4 months',
        thumbnail: '',
        category: 'OFFLINE',
        categoryId: offlineCategory.id,
        mentorId: null,
        createdBy: creatorId,
        isActive: true,
        featured: true
      },
      {
        title: 'Data Science with Python',
        slug: 'data-science-python-offline',
        description: 'Comprehensive data science course with in-person classes. Learn Python programming, data analysis, machine learning, and data visualization through practical projects and expert guidance.',
        shortDescription: 'In-person data science training',
        price: 30000,
        duration: '6 months',
        thumbnail: '',
        category: 'OFFLINE',
        categoryId: offlineCategory.id,
        mentorId: null,
        createdBy: creatorId,
        isActive: true,
        featured: true
      },
      {
        title: 'Digital Marketing Mastery',
        slug: 'digital-marketing-mastery-offline',
        description: 'Complete digital marketing course with classroom sessions. Master SEO, social media marketing, content marketing, PPC advertising, and analytics through real-world projects and case studies.',
        shortDescription: 'Classroom digital marketing program',
        price: 18000,
        duration: '3 months',
        thumbnail: '',
        category: 'OFFLINE',
        categoryId: offlineCategory.id,
        mentorId: null,
        createdBy: creatorId,
        isActive: true,
        featured: false
      }
    ];

    for (const courseData of offlineCourses) {
      // Check if course already exists
      const existingCourse = await prisma.course.findFirst({
        where: {
          slug: courseData.slug
        }
      });

      if (existingCourse) {
        console.log(`✅ Course already exists: ${existingCourse.title}`);
        continue;
      }

      const course = await prisma.course.create({
        data: courseData
      });

      console.log(`✅ Created offline course: ${course.title}`);

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

    console.log('🎉 Real offline courses added successfully!');
    console.log('📱 The OFFLINE tab should now appear in the category toggler.');

  } catch (error) {
    console.error('❌ Error adding offline courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addRealOfflineCourses();
