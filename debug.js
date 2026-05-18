const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debug() {
  try {
    console.log('Checking categories...');
    
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    console.log('Categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - ${cat._count.courses} courses`);
    });

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      select: {
        title: true,
        category: true,
        categoryId: true
      }
    });

    console.log('\nCourses:');
    courses.forEach(course => {
      console.log(`- ${course.title} - category: ${course.category}, categoryId: ${course.categoryId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
