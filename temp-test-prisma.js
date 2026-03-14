const { PrismaClient } = require('@prisma/client');

async function testPrismaTypes() {
  const prisma = new PrismaClient();
  
  try {
    // Test if we can access the new fields
    const enrollment = await prisma.enrollment.findFirst();
    if (enrollment) {
      console.log('Enrollment fields available:');
      console.log('- paymentStatus:', enrollment.paymentStatus);
      console.log('- transactionId:', enrollment.transactionId);
      console.log('- metadata:', enrollment.metadata);
    }
    
    // Test enum values
    console.log('\nPaymentStatus enum values:');
    console.log(Object.values(prisma._engineConfig.enums.PaymentStatus));
    
    console.log('\nEnrollmentStatus enum values:');
    console.log(Object.values(prisma._engineConfig.enums.EnrollmentStatus));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaTypes();
