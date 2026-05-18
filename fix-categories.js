const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCategories() {
  try {
    const offlineCategory = await prisma.category.findUnique({
      where: { slug: 'offline-courses' }
    });

    if (!offlineCategory) {
      console.log('Offline category not found');
      return;
    }

    console.log('Updating offline courses...');
    
    const result = await prisma.course.updateMany({
      where: { category: 'OFFLINE' },
      data: { 
        categoryId: offlineCategory.id,
        category: 'OFFLINE'
      }
    });

    console.log(`Updated ${result.count} courses`);
    
    // Also add some online and recorded courses for testing
    const onlineCategory = await prisma.category.findUnique({
      where: { slug: 'online-courses' }
    });

    const recordedCategory = await prisma.category.findUnique({
      where: { slug: 'recorded-courses' }
    });

    if (onlineCategory) {
      const onlineResult = await prisma.course.updateMany({
        where: { category: 'ONLINE' },
        data: { categoryId: onlineCategory.id }
      });
      console.log(`Updated ${onlineResult.count} online courses`);
    }

    if (recordedCategory) {
      const recordedResult = await prisma.course.updateMany({
        where: { category: 'RECORDED' },
        data: { categoryId: recordedCategory.id }
      });
      console.log(`Updated ${recordedResult.count} recorded courses`);
    }

    console.log('Categories fixed!');

    // Verify the fix
    const apiCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        courses: {
          some: {
            isActive: true
          }
        }
      },
      include: {
        courses: {
          where: {
            isActive: true
          }
        }
      }
    });

    console.log('\nAPI will now return these categories:');
    apiCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - ${cat.courses.length} courses`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategories();
