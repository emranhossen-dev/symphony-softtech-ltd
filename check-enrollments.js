const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEnrollments() {
  try {
    console.log('Checking enrollments...\n');

    // Get all enrollments
    const enrollments = await prisma.enrollment.findMany({
      include: {
        category: true,
        course: true
      }
    });

    console.log(`Total enrollments: ${enrollments.length}\n`);

    // Check category distribution
    const categoryStats = {};
    enrollments.forEach(e => {
      const categoryName = e.category?.name || 'No Category';
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = 0;
      }
      categoryStats[categoryName]++;
    });

    console.log('Enrollments by category:');
    Object.entries(categoryStats).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    // Check status distribution
    const statusStats = {};
    enrollments.forEach(e => {
      const status = e.enrollmentStatus;
      if (!statusStats[status]) {
        statusStats[status] = 0;
      }
      statusStats[status]++;
    });

    console.log('\nEnrollments by status:');
    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Show sample enrollments
    console.log('\nSample enrollments (first 5):');
    enrollments.slice(0, 5).forEach(e => {
      console.log(`  ID: ${e.id}`);
      console.log(`  Name: ${e.fullName}`);
      console.log(`  Course: ${e.courseName}`);
      console.log(`  Category: ${e.category?.name || 'None'} (categoryId: ${e.categoryId})`);
      console.log(`  Status: ${e.enrollmentStatus}`);
      console.log('  ---');
    });

    // Check enrollments without category
    const withoutCategory = enrollments.filter(e => !e.categoryId);
    console.log(`\nEnrollments without categoryId: ${withoutCategory.length}`);
    if (withoutCategory.length > 0) {
      console.log('Sample without category:');
      withoutCategory.slice(0, 3).forEach(e => {
        console.log(`  ${e.fullName} - ${e.courseName}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnrollments();
