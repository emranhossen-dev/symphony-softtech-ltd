const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setFeaturedCourses() {
  try {
    console.log('Setting featured courses...');

    // Get all active courses
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: { categoryRelation: true }
    });

    console.log(`Found ${courses.length} active courses`);

    // Mark first 6 courses as featured (or all if less than 6)
    const coursesToFeature = courses.slice(0, Math.min(6, courses.length));
    
    for (const course of coursesToFeature) {
      await prisma.course.update({
        where: { id: course.id },
        data: { featured: true }
      });
      console.log(`Marked as featured: ${course.title}`);
    }

    console.log(`Successfully marked ${coursesToFeature.length} courses as featured!`);

    // Summary
    const featuredCount = await prisma.course.count({
      where: { featured: true, isActive: true }
    });
    
    console.log(`Total featured courses: ${featuredCount}`);

  } catch (error) {
    console.error('Error setting featured courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setFeaturedCourses();
