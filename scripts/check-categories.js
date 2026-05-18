const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 Checking all categories in database...');
    
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    console.log(`📋 Found ${categories.length} categories:`);
    
    categories.forEach(category => {
      console.log(`   - ${category.name} (slug: ${category.slug}) - ${category._count.courses} courses`);
      console.log(`     Active: ${category.isActive}, Icon: ${category.icon}`);
    });

    console.log('\n🎯 Expected category slugs for toggler:');
    console.log('   - live-classes');
    console.log('   - recorded-courses');
    console.log('   - online-courses');
    console.log('   - offline-courses');
    console.log('   - government-courses');

  } catch (error) {
    console.error('❌ Error checking categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
