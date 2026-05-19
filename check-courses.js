const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCoursesAndModules() {
  try {
    console.log('Checking courses...');
    
    // Get all courses
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { modules: true }
        }
      }
    });

    console.log(`Found ${courses.length} courses:`);
    
    courses.forEach(course => {
      console.log(`\nCourse: ${course.title}`);
      console.log(`ID: ${course.id}`);
      console.log(`Active: ${course.isActive}`);
      console.log(`Modules count: ${course._count.modules}`);
      
      if (course.modules.length > 0) {
        console.log('Modules:');
        course.modules.forEach((module, index) => {
          console.log(`  ${index + 1}. ${module.title} (Order: ${module.order})`);
          console.log(`     Video URL: ${module.videoUrl || 'No video'}`);
          console.log(`     Homework: ${module.homework ? 'Yes' : 'No'}`);
          console.log(`     Locked: ${module.isLocked}`);
        });
      } else {
        console.log('  No modules found');
      }
    });

    // Check enrollments
    console.log('\n\nChecking enrollments...');
    const enrollments = await prisma.enrollment.findMany({
      include: {
        course: {
          include: {
            modules: true
          }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`Found ${enrollments.length} enrollments:`);
    
    enrollments.forEach(enrollment => {
      console.log(`\nEnrollment: ${enrollment.user.name} (${enrollment.user.email})`);
      console.log(`Course: ${enrollment.course.title}`);
      console.log(`Status: ${enrollment.enrollmentStatus}`);
      console.log(`Course modules: ${enrollment.course.modules.length}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCoursesAndModules();
