const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkApiResponse() {
  try {
    // Simulate the API query
    const where = {
      category: 'ONLINE'
    };

    const courses = await prisma.course.findMany({
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
      orderBy: { createdAt: 'desc' }
    });

    console.log('API Response simulation:');
    courses.forEach(course => {
      if (course.title.includes('Digital Marketing')) {
        console.log('Digital Marketing Course:');
        console.log('Title:', course.title);
        console.log('Module count from _count:', course._count.modules);
        console.log('Full _count object:', course._count);
        console.log('Course ID:', course.id);
        console.log('---');
      }
    });

    // Check if there's an issue with the mapping in the API
    const mappedCourses = courses.map(course => ({
      ...course,
      regularPrice: course.price, // Map price to regularPrice for admin panel
      enrollmentCount: course._count.enrollments
    }));

    console.log('\nAfter API mapping:');
    mappedCourses.forEach(course => {
      if (course.title.includes('Digital Marketing')) {
        console.log('Digital Marketing Course after mapping:');
        console.log('Title:', course.title);
        console.log('Module count:', course._count?.modules);
        console.log('Enrollment count:', course.enrollmentCount);
        console.log('---');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApiResponse();
