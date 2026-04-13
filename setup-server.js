const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupCompleteDatabase() {
  try {
    console.log('=== SETTING UP TRAINING CENTRE DATABASE ===\n');

    // Step 1: Create categories
    console.log('1. Creating categories...');
    const govCategory = await prisma.category.upsert({
      where: { slug: 'government' },
      update: {},
      create: {
        name: 'Government',
        slug: 'government',
        description: 'Government job preparation courses',
        icon: 'government',
        color: '#16A34A'
      }
    });

    const onlineCategory = await prisma.category.upsert({
      where: { slug: 'online' },
      update: {},
      create: {
        name: 'Online',
        slug: 'online',
        description: 'Online learning courses',
        icon: 'online',
        color: '#3B82F6'
      }
    });

    const recordedCategory = await prisma.category.upsert({
      where: { slug: 'recorded' },
      update: {},
      create: {
        name: 'Recorded',
        slug: 'recorded',
        description: 'Self-paced recorded courses',
        icon: 'recorded',
        color: '#8B5CF6'
      }
    });

    console.log('   Categories created successfully!');

    // Step 2: Create users
    console.log('2. Creating users...');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    const mentor1 = await prisma.user.upsert({
      where: { email: 'dr.ahmed@example.com' },
      update: {},
      create: {
        email: 'dr.ahmed@example.com',
        password: 'mentor123',
        name: 'Dr. Ahmed Rahman',
        role: 'MENTOR'
      }
    });

    const mentor2 = await prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        password: 'mentor123',
        name: 'John Doe',
        role: 'MENTOR'
      }
    });

    const mentor3 = await prisma.user.upsert({
      where: { email: 'sarah.wilson@example.com' },
      update: {},
      create: {
        email: 'sarah.wilson@example.com',
        password: 'mentor123',
        name: 'Sarah Wilson',
        role: 'MENTOR'
      }
    });

    console.log('   Users created successfully!');

    // Step 3: Create courses with modules
    console.log('3. Creating courses with modules...');
    
    // Course 1: BCS Preparation
    const bcsCourse = await prisma.course.upsert({
      where: { slug: 'bcs-preparation-complete' },
      update: {},
      create: {
        title: 'BCS Preparation Complete Course',
        slug: 'bcs-preparation-complete',
        description: 'Complete BCS exam preparation with all subjects, mock tests, and interview guidance. This comprehensive course covers everything you need to succeed in the Bangladesh Civil Service examination.',
        shortDescription: 'Complete BCS exam preparation with mock tests',
        price: 5000,
        duration: '6 months',
        category: 'GOVERNMENT',
        categoryId: govCategory.id,
        mentorId: mentor1.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop'
      }
    });

    const bcsModules = [
      {
        title: 'Module 1: Bangla Language & Literature',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        homework: 'Complete Bangla grammar exercises and write essay on Rabindranath Tagore',
        order: 1,
        isLocked: false
      },
      {
        title: 'Module 2: Mathematics & Quantitative Aptitude',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        homework: 'Solve arithmetic problems and complete geometry exercises',
        order: 2,
        isLocked: false
      },
      {
        title: 'Module 3: General Knowledge & Current Affairs',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        homework: 'Read daily news and prepare current affairs notes',
        order: 3,
        isLocked: false
      }
    ];

    for (const moduleData of bcsModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: bcsCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: bcsCourse.id
          }
        });
      }
    }

    // Course 2: Web Development
    const webCourse = await prisma.course.upsert({
      where: { slug: 'full-stack-web-development' },
      update: {},
      create: {
        title: 'Full Stack Web Development Bootcamp',
        slug: 'full-stack-web-development',
        description: 'Learn modern web development from scratch. Master HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and become job-ready.',
        shortDescription: 'Complete web development with React & Node.js',
        price: 8000,
        duration: '4 months',
        category: 'ONLINE',
        categoryId: onlineCategory.id,
        mentorId: mentor2.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop'
      }
    });

    const webModules = [
      {
        title: 'Module 1: HTML5 & CSS3 Fundamentals',
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        homework: 'Create a responsive portfolio website',
        order: 1,
        isLocked: false
      },
      {
        title: 'Module 2: JavaScript Programming',
        videoUrl: 'https://www.youtube.com/watch?v=example5',
        homework: 'Build a todo application with vanilla JavaScript',
        order: 2,
        isLocked: false
      },
      {
        title: 'Module 3: React.js & Modern Frontend',
        videoUrl: 'https://www.youtube.com/watch?v=example6',
        homework: 'Create a React dashboard with components',
        order: 3,
        isLocked: false
      }
    ];

    for (const moduleData of webModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: webCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: webCourse.id
          }
        });
      }
    }

    // Course 3: Data Science
    const dataCourse = await prisma.course.upsert({
      where: { slug: 'data-science-fundamentals' },
      update: {},
      create: {
        title: 'Data Science Fundamentals',
        slug: 'data-science-fundamentals',
        description: 'Master data science from basics to advanced. Learn Python, machine learning, data visualization, and statistical analysis with hands-on projects.',
        shortDescription: 'Complete data science with Python & ML',
        price: 12000,
        duration: '5 months',
        category: 'RECORDED',
        categoryId: recordedCategory.id,
        mentorId: mentor3.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'
      }
    });

    const dataModules = [
      {
        title: 'Module 1: Python Programming for Data Science',
        videoUrl: 'https://www.youtube.com/watch?v=example7',
        homework: 'Complete data analysis with pandas and numpy',
        order: 1,
        isLocked: false
      },
      {
        title: 'Module 2: Machine Learning Algorithms',
        videoUrl: 'https://www.youtube.com/watch?v=example8',
        homework: 'Build classification and regression models',
        order: 2,
        isLocked: false
      },
      {
        title: 'Module 3: Deep Learning & Neural Networks',
        videoUrl: 'https://www.youtube.com/watch?v=example9',
        homework: 'Create neural networks with TensorFlow',
        order: 3,
        isLocked: false
      }
    ];

    for (const moduleData of dataModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: dataCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: dataCourse.id
          }
        });
      }
    }

    console.log('   Courses and modules created successfully!');

    // Step 4: Add realistic enrollments
    console.log('4. Adding realistic enrollments...');
    
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        categoryId: true,
        price: true
      }
    });

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

    for (const course of courses) {
      const enrollmentCount = Math.floor(Math.random() * 8) + 5; // 5-12 enrollments per course
      
      for (let i = 0; i < Math.min(enrollmentCount, students.length); i++) {
        const student = students[i];
        
        // Check if enrollment already exists
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            courseId: course.id,
            email: student.email
          }
        });

        if (!existingEnrollment) {
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
              amount: course.price,
              paymentStatus: 'PAID'
            }
          });

          totalEnrollments++;
        }
      }
    }

    console.log(`   ${totalEnrollments} enrollments added successfully!`);

    // Step 5: Create some sample notifications
    console.log('5. Creating sample notifications...');
    
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MENTOR']
        }
      }
    });

    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ENROLLMENT_APPROVED',
          title: 'New Enrollment Approved',
          message: 'A new student enrollment has been approved and is ready for review.',
          isRead: false
        }
      });
    }

    console.log('   Sample notifications created!');

    console.log('\n=== DATABASE SETUP COMPLETED SUCCESSFULLY! ===\n');
    console.log('Summary of what was created:');
    console.log(`- Categories: 3 (Government, Online, Recorded)`);
    console.log(`- Users: 4 (1 Admin, 3 Mentors)`);
    console.log(`- Courses: ${courses.length} with modules`);
    console.log(`- Enrollments: ${totalEnrollments}`);
    console.log(`- Payments: ${totalEnrollments}`);
    console.log(`- Notifications: ${users.length}`);
    
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Mentors: dr.ahmed@example.com / mentor123');
    console.log('         john.doe@example.com / mentor123');
    console.log('         sarah.wilson@example.com / mentor123');
    
    console.log('\nYour training centre is now ready!');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompleteDatabase();
