const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEnrollments() {
  try {
    // Get all enrollments without courseId
    const orphanedEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId: null
      },
      include: {
        user: true
      }
    });

    console.log('Orphaned enrollments found:', orphanedEnrollments.length);

    // Get all courses to match
    const courses = await prisma.course.findMany();
    console.log('Available courses:', courses.length);

    // Create a mapping of course names to IDs
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course.title.toLowerCase()] = course.id;
    });

    console.log('\nCourse mapping:');
    Object.entries(courseMap).forEach(([name, id]) => {
      console.log(`  ${name} -> ${id}`);
    });

    // Try to match enrollments to courses
    for (const enrollment of orphanedEnrollments) {
      const courseName = enrollment.courseName.toLowerCase();
      console.log(`\nProcessing: ${enrollment.courseName}`);

      // Try exact match
      if (courseMap[courseName]) {
        console.log(`  Found exact match: ${courseMap[courseName]}`);
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { courseId: courseMap[courseName] }
        });
        continue;
      }

      // Try partial match
      for (const [name, id] of Object.entries(courseMap)) {
        if (name.includes(courseName.split(' ')[0]) || courseName.includes(name.split(' ')[0])) {
          console.log(`  Found partial match: ${name} -> ${id}`);
          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { courseId: id }
          });
          break;
        }
      }
    }

    console.log('\n✓ Enrollment fixing complete');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnrollments();
