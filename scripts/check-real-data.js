const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRealData() {
  try {
    console.log('=== CHECKING REAL DATABASE DATA ===\n');

    // 1. Check courses
    console.log('1. COURSES:');
    const courses = await prisma.course.findMany({
      include: {
        categoryRelation: true,
        mentor: true,
        creator: true,
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        }
      }
    });

    console.log(`Total courses in database: ${courses.length}`);
    
    if (courses.length > 0) {
      courses.forEach((course, index) => {
        console.log(`\nCourse ${index + 1}:`);
        console.log(`  ID: ${course.id}`);
        console.log(`  Title: ${course.title}`);
        console.log(`  Category: ${course.category} (categoryId: ${course.categoryId})`);
        console.log(`  Category Relation: ${course.categoryRelation?.name || 'NULL'}`);
        console.log(`  Price: ${course.price}`);
        console.log(`  Active: ${course.isActive}`);
        console.log(`  Featured: ${course.featured}`);
        console.log(`  Enrollments: ${course._count.enrollments}`);
        console.log(`  Modules: ${course._count.modules}`);
      });
    } else {
      console.log('No courses found in database!');
    }

    // 2. Check categories
    console.log('\n\n2. CATEGORIES:');
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            courses: true
          }
        }
      }
    });

    console.log(`Total categories in database: ${categories.length}`);
    
    if (categories.length > 0) {
      categories.forEach((cat, index) => {
        console.log(`\nCategory ${index + 1}:`);
        console.log(`  ID: ${cat.id}`);
        console.log(`  Name: ${cat.name}`);
        console.log(`  Slug: ${cat.slug}`);
        console.log(`  Courses count: ${cat._count.courses}`);
      });
    } else {
      console.log('No categories found in database!');
    }

    // 3. Check users/mentors
    console.log('\n\n3. USERS:');
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['MENTOR', 'ADMIN']
        }
      }
    });

    console.log(`Total mentors/admins in database: ${users.length}`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Active: ${user.isActive}`);
      });
    } else {
      console.log('No mentors/admins found in database!');
    }

    // 4. Test API connection
    console.log('\n\n4. DATABASE CONNECTION TEST:');
    try {
      const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection: SUCCESS');
    } catch (dbError) {
      console.log('❌ Database connection: FAILED');
      console.log('Error:', dbError.message);
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Courses: ${courses.length}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Mentors/Admins: ${users.length}`);
    
    if (courses.length === 0) {
      console.log('\n⚠️  WARNING: No courses in database - APIs will return mock data!');
    } else {
      console.log('\n✅ Real data found - APIs should return database data!');
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRealData();
