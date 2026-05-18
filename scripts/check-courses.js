const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourses() {
  try {
    console.log('🔍 Checking all courses in database...');
    
    const courses = await prisma.course.findMany({
      include: {
        categoryRelation: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    console.log(`📋 Found ${courses.length} courses:`);
    
    courses.forEach(course => {
      console.log(`   - ${course.title} (category: ${course.category})`);
      console.log(`     Active: ${course.isActive}, Featured: ${course.featured}`);
    });

    // Check courses by category
    const coursesByCategory = await prisma.course.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    console.log('\n📊 Active courses by category:');
    coursesByCategory.forEach(group => {
      console.log(`   - ${group.category}: ${group._count.id} courses`);
    });

  } catch (error) {
    console.error('❌ Error checking courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourses();
