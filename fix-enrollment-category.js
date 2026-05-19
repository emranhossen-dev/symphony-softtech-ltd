const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEnrollmentCategories() {
  try {
    console.log('Fixing enrollment categories...\n');

    // Get all enrollments without categoryId
    const enrollmentsWithoutCategory = await prisma.enrollment.findMany({
      where: {
        categoryId: null
      },
      include: {
        course: {
          include: {
            categoryRelation: true
          }
        }
      }
    });

    console.log(`Found ${enrollmentsWithoutCategory.length} enrollments without categoryId\n`);

    // Update each enrollment
    for (const enrollment of enrollmentsWithoutCategory) {
      console.log(`Processing: ${enrollment.fullName} - ${enrollment.courseName}`);
      
      let categoryId = null;
      
      // Try to get categoryId from course
      if (enrollment.course && enrollment.course.categoryId) {
        categoryId = enrollment.course.categoryId;
        console.log(`  Using course categoryId: ${categoryId}`);
      }
      // Try to get from course categoryRelation
      else if (enrollment.course && enrollment.course.categoryRelation) {
        categoryId = enrollment.course.categoryRelation.id;
        console.log(`  Using course categoryRelation id: ${categoryId}`);
      }
      // Try to find category by course category string
      else if (enrollment.course && enrollment.course.category) {
        const category = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: enrollment.course.category.toLowerCase() },
              { name: { equals: enrollment.course.category, mode: 'insensitive' } }
            ]
          }
        });
        
        if (category) {
          categoryId = category.id;
          console.log(`  Found category by course.category string: ${category.name} (${categoryId})`);
        }
      }

      if (categoryId) {
        // Update enrollment
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { categoryId }
        });
        console.log(`  ✅ Updated enrollment with categoryId: ${categoryId}\n`);
      } else {
        console.log(`  ❌ Could not find categoryId for this enrollment\n`);
      }
    }

    // Also check and fix courses without categoryId
    const coursesWithoutCategory = await prisma.course.findMany({
      where: {
        categoryId: null
      }
    });

    console.log(`\nFound ${coursesWithoutCategory.length} courses without categoryId\n`);

    for (const course of coursesWithoutCategory) {
      console.log(`Processing course: ${course.title}`);
      
      let categoryId = null;
      
      // Try to find category by course category string
      if (course.category) {
        const category = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: course.category.toLowerCase() },
              { name: { equals: course.category, mode: 'insensitive' } }
            ]
          }
        });
        
        if (category) {
          categoryId = category.id;
          console.log(`  Found category: ${category.name} (${categoryId})`);
          
          // Update course
          await prisma.course.update({
            where: { id: course.id },
            data: { categoryId }
          });
          console.log(`  ✅ Updated course with categoryId: ${categoryId}\n`);
        } else {
          console.log(`  ❌ Could not find category for: ${course.category}\n`);
        }
      } else {
        console.log(`  ❌ Course has no category string\n`);
      }
    }

    console.log('Done!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnrollmentCategories();
