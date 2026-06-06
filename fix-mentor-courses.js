const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMentorCourses() {
  try {
    const mentorId = 'cmq1ekmbm000slsrf2y74u08q';
    
    // Get all courses assigned to mentor
    const courses = await prisma.course.findMany({
      where: { mentorId },
      select: { id: true, title: true, category: true, isActive: true }
    });
    
    console.log('Courses assigned to mentor:', courses);
    console.log('\nTotal courses:', courses.length);
    
    // Check if these are real courses or dummy ones
    // Real courses should have proper titles and categories
    const dummyCourses = courses.filter(c => 
      c.title.toLowerCase().includes('test') || 
      c.title.toLowerCase().includes('dummy') ||
      c.category === null ||
      c.category === ''
    );
    
    console.log('\nPotential dummy courses:', dummyCourses);
    
    // Remove mentorId from dummy courses
    if (dummyCourses.length > 0) {
      console.log(`\nRemoving mentorId from ${dummyCourses.length} dummy courses...`);
      for (const course of dummyCourses) {
        await prisma.course.update({
          where: { id: course.id },
          data: { mentorId: null }
        });
        console.log(`Removed mentor from: ${course.title}`);
      }
      console.log('\nDone!');
    } else {
      console.log('\nNo dummy courses found. All courses look legitimate.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMentorCourses();
