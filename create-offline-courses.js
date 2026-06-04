const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createOfflineCourses() {
  try {
    // Check if offline category exists
    let offlineCategory = await prisma.category.findUnique({
      where: { name: 'OFFLINE' }
    });

    if (!offlineCategory) {
      console.log('Creating OFFLINE category...');
      offlineCategory = await prisma.category.create({
        data: {
          name: 'OFFLINE',
          slug: 'offline',
          description: 'Offline classroom courses',
          icon: 'Monitor',
          color: '#f97316'
        }
      });
      console.log('Created OFFLINE category:', offlineCategory.id);
    }

    // Create the missing courses
    const coursesToCreate = [
      {
        title: 'Web Development With Python',
        slug: 'web-development-with-python-offline',
        description: 'Comprehensive web development course using Python, covering Django, Flask, and modern web technologies. Perfect for beginners and intermediate learners.',
        shortDescription: 'Learn web development with Python from scratch',
        duration: '3 months',
        category: 'OFFLINE',
        categoryId: offlineCategory.id,
        price: 15000,
        originalPrice: 20000,
        discountPercent: 25,
        featured: true,
        isActive: true
      },
      {
        title: 'Web Design and Development With Python',
        slug: 'web-design-and-development-with-python-offline',
        description: 'Complete web design and development course using Python. Learn frontend design, backend development, database management, and deployment.',
        shortDescription: 'Master web design and development with Python',
        duration: '4 months',
        category: 'OFFLINE',
        categoryId: offlineCategory.id,
        price: 18000,
        originalPrice: 25000,
        discountPercent: 28,
        featured: true,
        isActive: true
      }
    ];

    console.log('\nCreating courses...');
    for (const courseData of coursesToCreate) {
      // Check if course already exists
      const existing = await prisma.course.findUnique({
        where: { slug: courseData.slug }
      });

      if (existing) {
        console.log(`Course already exists: ${courseData.title}`);
        continue;
      }

      // Get a user to be the creator (use the first admin or create one)
      const creator = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (!creator) {
        console.log('No admin user found to create course');
        continue;
      }

      const course = await prisma.course.create({
        data: {
          ...courseData,
          createdBy: creator.id
        }
      });

      console.log(`Created course: ${course.title} (ID: ${course.id})`);

      // Update enrollments to link to this course
      const updated = await prisma.enrollment.updateMany({
        where: {
          courseName: courseData.title,
          courseId: null
        },
        data: {
          courseId: course.id,
          categoryId: offlineCategory.id
        }
      });

      console.log(`  Updated ${updated.count} enrollments`);
    }

    console.log('\n✓ Courses created and enrollments linked successfully');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createOfflineCourses();
