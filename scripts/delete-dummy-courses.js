require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteDummyCourses() {
  try {
    console.log('🔍 Checking for dummy/test courses...\n');
    
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true
      }
    });

    console.log(`Found ${courses.length} course(s):\n`);
    
    if (courses.length === 0) {
      console.log('❌ No courses found in database!');
      return;
    }

    // Display all courses
    courses.forEach((course, index) => {
      console.log(`Course #${index + 1}:`);
      console.log(`  ID: ${course.id}`);
      console.log(`  Title: ${course.title}`);
      console.log(`  Slug: ${course.slug}`);
      console.log(`  Description: ${course.description?.substring(0, 100)}...`);
      console.log(`  Category: ${course.category || 'N/A'}\n`);
    });

    // Identify potential dummy courses
    const dummyKeywords = ['test', 'dummy', 'sample', 'example', 'demo'];
    const dummyCourses = courses.filter(course => 
      dummyKeywords.some(keyword => 
        course.title.toLowerCase().includes(keyword) ||
        course.slug.toLowerCase().includes(keyword) ||
        (course.description && course.description.toLowerCase().includes(keyword))
      )
    );

    console.log(`\n🎯 Found ${dummyCourses.length} potential dummy course(s):\n`);
    
    if (dummyCourses.length === 0) {
      console.log('✅ No dummy/test courses found!');
      
      // Ask if user wants to delete all courses
      console.log('\n⚠️  Do you want to delete ALL courses? This cannot be undone!');
      console.log('Please modify this script to delete specific courses if needed.');
      return;
    }

    dummyCourses.forEach((course, index) => {
      console.log(`Dummy Course #${index + 1}:`);
      console.log(`  ID: ${course.id}`);
      console.log(`  Title: ${course.title}\n`);
    });

    // Delete dummy courses
    console.log('\n🗑️  Deleting dummy courses...\n');
    
    for (const course of dummyCourses) {
      // Delete related records first (enrollments, modules, etc.)
      await prisma.enrollment.deleteMany({
        where: { courseId: course.id }
      });
      
      await prisma.module.deleteMany({
        where: { courseId: course.id }
      });
      
      await prisma.video.deleteMany({
        where: { courseId: course.id }
      });
      
      // Delete the course
      await prisma.course.delete({
        where: { id: course.id }
      });
      
      console.log(`✅ Deleted: ${course.title}`);
    }
    
    console.log(`\n🎉 Successfully deleted ${dummyCourses.length} dummy course(s)!`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDummyCourses();
