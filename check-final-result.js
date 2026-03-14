const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFinalResult() {
  try {
    console.log('🎉 Checking final result...\n');

    // Get courses with modules and enrollments
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true
          }
        },
        categoryRelation: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📚 Courses Created for Landing Page:');
    console.log('=' .repeat(60));

    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   📁 Category: ${course.categoryRelation?.name || course.category}`);
      console.log(`   💰 Price: ৳${course.price.toLocaleString()}`);
      console.log(`   ⏱️  Duration: ${course.duration}`);
      console.log(`   📖 Modules: ${course._count.modules}`);
      console.log(`   👥 Students: ${course._count.enrollments}`);
      console.log(`   ✅ Status: ${course.isActive ? 'Active' : 'Inactive'}`);
      
      if (course.shortDescription) {
        console.log(`   📝 Description: ${course.shortDescription}`);
      }
    });

    // Get total stats
    const totalStats = await prisma.$transaction([
      prisma.course.count(),
      prisma.module.count(),
      prisma.enrollment.count(),
      prisma.category.count()
    ]);

    console.log('\n' + '=' .repeat(60));
    console.log('📊 Overall Statistics:');
    console.log(`   📚 Total Courses: ${totalStats[0]}`);
    console.log(`   📖 Total Modules: ${totalStats[1]}`);
    console.log(`   👥 Total Enrollments: ${totalStats[2]}`);
    console.log(`   🏷️  Total Categories: ${totalStats[3]}`);

    console.log('\n🌟 Your landing page is now ready with realistic data!');
    console.log('🎯 Students will see actual courses with modules and enrollment numbers!');

  } catch (error) {
    console.error('Error checking result:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalResult();
