const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addRealisticEnrollments() {
  try {
    console.log('Adding realistic enrollments...');

    // Get all courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        categoryId: true
      }
    });

    // Sample student names and data
    const students = [
      { fullName: 'Rahman Khan', email: 'rahman.khan@email.com', phone: '01712345678' },
      { fullName: 'Fatema Akter', email: 'fatema.akter@email.com', phone: '01812345678' },
      { fullName: 'Mohammad Ali', email: 'mohammad.ali@email.com', phone: '01912345678' },
      { fullName: 'Ayesha Siddiqua', email: 'ayesha.siddiqua@email.com', phone: '01612345678' },
      { fullName: 'Karim Uddin', email: 'karim.uddin@email.com', phone: '01512345678' },
      { fullName: 'Sultana Begum', email: 'sultana.begum@email.com', phone: '01412345678' },
      { fullName: 'Abu Bakr', email: 'abu.bakr@email.com', phone: '01312345678' },
      { fullName: 'Mariam Khatun', email: 'mariam.khatun@email.com', phone: '01112345678' },
      { fullName: 'Yusuf Islam', email: 'yusuf.islam@email.com', phone: '01722345678' },
      { fullName: 'Nusrat Jahan', email: 'nusrat.jahan@email.com', phone: '01822345678' }
    ];

    let totalEnrollments = 0;

    // Add enrollments for each course
    for (const course of courses) {
      const enrollmentCount = Math.floor(Math.random() * 8) + 5; // 5-12 enrollments per course
      
      for (let i = 0; i < Math.min(enrollmentCount, students.length); i++) {
        const student = students[i];
        
        // Create enrollment
        const enrollment = await prisma.enrollment.create({
          data: {
            fullName: student.fullName,
            email: student.email,
            phoneNumber: student.phone,
            address: `Dhaka, Bangladesh - Area ${i + 1}`,
            courseId: course.id,
            courseName: course.title,
            categoryId: course.categoryId,
            enrollmentStatus: 'APPROVED',
            educationLevel: course.category === 'GOVERNMENT' ? 'Bachelor' : undefined,
            whyJoin: course.category === 'GOVERNMENT' ? 'Want to serve the nation through civil service' : undefined,
            preferredBatchTime: course.category === 'ONLINE' ? 'Evening' : undefined
          }
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            enrollmentId: enrollment.id,
            paymentMethod: 'bkash',
            transactionId: `TXN${Date.now()}${i}`,
            amount: course.category === 'GOVERNMENT' ? 5000 : course.category === 'ONLINE' ? 8000 : 12000,
            paymentStatus: 'PAID'
          }
        });

        totalEnrollments++;
      }
    }

    console.log(`\n✅ Successfully created ${totalEnrollments} realistic enrollments!`);
    console.log('\n📊 Enrollment Summary:');
    
    for (const course of courses) {
      const enrollmentCount = await prisma.enrollment.count({
        where: { courseId: course.id }
      });
      console.log(`📚 ${course.title}: ${enrollmentCount} students`);
    }

    console.log('\n🎓 Your landing page will now show realistic enrollment numbers!');

  } catch (error) {
    console.error('Error adding enrollments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addRealisticEnrollments();
