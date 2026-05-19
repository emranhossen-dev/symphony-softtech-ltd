const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEnrollmentStatuses() {
  try {
    console.log('Fetching all enrollments...');
    const enrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
        enrollmentStatus: true
      }
    });

    console.log(`Found ${enrollments.length} enrollments`);
    
    // Map old status values to new ones
    const statusMap = {
      'PENDING_REVIEW': 'APPLIED',
      'PAYMENT_PENDING': 'WAITING',
      'APPROVED': 'ADMITTED',
      'ENROLLED': 'ADMITTED',
      'COMPLETED': 'ADMITTED'
    };

    let updatedCount = 0;
    
    for (const enrollment of enrollments) {
      const oldStatus = enrollment.enrollmentStatus;
      const newStatus = statusMap[oldStatus];
      
      if (newStatus && oldStatus !== newStatus) {
        console.log(`Updating enrollment ${enrollment.id}: ${oldStatus} -> ${newStatus}`);
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { enrollmentStatus: newStatus }
        });
        updatedCount++;
      }
    }

    console.log(`\n✅ Updated ${updatedCount} enrollments`);
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnrollmentStatuses();
