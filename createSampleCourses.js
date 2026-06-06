const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleCourses() {
  try {
    console.log('Creating sample courses...\n');

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }

    const coursesData = [
      {
        title: 'Web Development Bootcamp',
        slug: 'web-development-bootcamp',
        description: 'Learn full-stack web development with modern technologies',
        shortDescription: 'Complete web development course',
        category: 'Government',
        price: 0,
        originalPrice: 29999,
        discountPercent: 100,
        duration: '3 months',
        isActive: true,
        featured: true,
        mentorId: admin.id,
        createdBy: admin.id
      },
      {
        title: 'Python for Data Science',
        slug: 'python-data-science',
        description: 'Master Python programming for data analysis and machine learning',
        shortDescription: 'Python data science course',
        category: 'Online',
        price: 15000,
        originalPrice: 25000,
        discountPercent: 40,
        duration: '2 months',
        isActive: true,
        featured: true,
        mentorId: admin.id,
        createdBy: admin.id
      },
      {
        title: 'Digital Marketing Mastery',
        slug: 'digital-marketing-mastery',
        description: 'Learn digital marketing strategies and tools',
        shortDescription: 'Complete digital marketing course',
        category: 'Offline',
        price: 10000,
        originalPrice: 20000,
        discountPercent: 50,
        duration: '1 month',
        isActive: true,
        featured: false,
        mentorId: admin.id,
        createdBy: admin.id
      }
    ];

    for (const courseData of coursesData) {
      const existingCourse = await prisma.course.findUnique({
        where: { slug: courseData.slug }
      });

      if (existingCourse) {
        console.log(`⚠️  Course already exists: ${courseData.title}`);
        continue;
      }

      const course = await prisma.course.create({
        data: courseData
      });

      console.log(`✅ Created course: ${course.title}`);
    }

    console.log('\n📊 Summary:');
    const totalCourses = await prisma.course.count();
    console.log(`Total courses in database: ${totalCourses}`);

  } catch (error) {
    console.error('Error creating courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleCourses();
