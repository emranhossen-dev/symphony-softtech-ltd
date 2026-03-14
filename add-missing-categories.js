const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingCategories() {
  try {
    console.log('Adding missing categories...');

    // Get or create mentors
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

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Create Live Classes Category
    const liveCategory = await prisma.category.upsert({
      where: { slug: 'live-classes' },
      update: {},
      create: {
        name: 'Live Classes',
        slug: 'live-classes',
        description: 'Interactive live classes with real-time learning',
        icon: 'live-classes',
        color: '#EF4444'
      }
    });

    // Create Offline Classes Category
    const offlineCategory = await prisma.category.upsert({
      where: { slug: 'offline-courses' },
      update: {},
      create: {
        name: 'Offline Courses',
        slug: 'offline-courses',
        description: 'In-person classroom training sessions',
        icon: 'offline-courses',
        color: '#F59E0B'
      }
    });

    // Course 1: Live BCS Crash Course
    const liveBCSCourse = await prisma.course.upsert({
      where: { slug: 'live-bcs-crash-course' },
      update: {},
      create: {
        title: 'Live BCS Crash Course',
        slug: 'live-bcs-crash-course',
        description: 'Intensive live BCS preparation with daily interactive sessions, doubt clearing, and real-time mock tests.',
        shortDescription: 'Live interactive BCS preparation',
        price: 7000,
        duration: '3 months',
        category: 'LIVE_CLASSES',
        categoryId: liveCategory.id,
        mentorId: mentor1.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a814d964?w=800&h=400&fit=crop'
      }
    });

    // Create modules for Live BCS course
    const liveBCSModules = [
      {
        title: '🎯 Live Module 1: Daily Current Affairs Discussion',
        videoUrl: 'https://www.youtube.com/watch?v=live1',
        homework: `**Live Current Affairs Discussion**

**Daily Schedule:**
- Morning Session: 9:00 AM - 10:30 AM
- Evening Review: 8:00 PM - 9:00 PM

**Live Activities:**
✅ Real-time news analysis
✅ Group discussions
✅ Quiz competitions
✅ Expert Q&A sessions

**Today's Topics:**
- National politics updates
- International relations
- Economic developments
- Science & technology news

**Interactive Features:**
- Live polls and surveys
- Breakout room discussions
- Screen sharing for explanations
- Whiteboard collaborations

📺 Join Zoom Meeting: Daily at scheduled times`,
        order: 1,
        isLocked: false
      },
      {
        title: '📝 Live Module 2: Interactive Problem Solving',
        videoUrl: 'https://www.youtube.com/watch?v=live2',
        homework: `**Live Problem Solving Session**

**Session Details:**
- Timing: 2:00 PM - 4:00 PM (Daily)
- Platform: Zoom + Digital Whiteboard
- Max Participants: 30 students

**Problem Areas Covered:**
- Mathematical reasoning
- Analytical ability
- Data interpretation
- Logical puzzles

**Live Features:**
- Step-by-step solutions
- Student participation
- Real-time doubt clearing
- Peer learning opportunities

**Homework Review:**
- Live evaluation of assignments
- Common mistakes discussion
- Best practices sharing

🧠 Problem sets shared 1 hour before session`,
        order: 2,
        isLocked: false
      }
    ];

    for (const moduleData of liveBCSModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: liveBCSCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: liveBCSCourse.id
          }
        });
      }
    }

    // Course 2: Live Programming Bootcamp
    const liveProgrammingCourse = await prisma.course.upsert({
      where: { slug: 'live-programming-bootcamp' },
      update: {},
      create: {
        title: 'Live Programming Bootcamp',
        slug: 'live-programming-bootcamp',
        description: 'Interactive live coding sessions with real-time project development and instant feedback.',
        shortDescription: 'Live coding with instant feedback',
        price: 10000,
        duration: '2 months',
        category: 'LIVE_CLASSES',
        categoryId: liveCategory.id,
        mentorId: mentor2.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop'
      }
    });

    // Create modules for Live Programming course
    const liveProgrammingModules = [
      {
        title: '💻 Live Module 1: Real-time Code Development',
        videoUrl: 'https://www.youtube.com/watch?v=live3',
        homework: `**Live Code Development Session**

**Daily Schedule:**
- Morning Theory: 10:00 AM - 11:00 AM
- Live Coding: 11:00 AM - 1:00 PM
- Practice Time: 2:00 PM - 4:00 PM

**Live Coding Features:**
✅ Screen sharing with code editor
✅ Real-time syntax highlighting
✅ Live debugging sessions
✅ Collaborative coding

**Today's Project:**
- Building a todo application
- Implementing user authentication
- Creating responsive design
- Database integration

**Interactive Elements:**
- Student code reviews
- Live pair programming
- Instant code suggestions
- Performance optimization tips

👨‍💻 Join live coding session daily`,
        order: 1,
        isLocked: false
      }
    ];

    for (const moduleData of liveProgrammingModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: liveProgrammingCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: liveProgrammingCourse.id
          }
        });
      }
    }

    // Course 3: Offline Spoken English
    const offlineEnglishCourse = await prisma.course.upsert({
      where: { slug: 'offline-spoken-english' },
      update: {},
      create: {
        title: 'Offline Spoken English Mastery',
        slug: 'offline-spoken-english',
        description: 'In-person spoken English classes with practical conversation practice and personality development.',
        shortDescription: 'Face-to-face English learning',
        price: 4000,
        duration: '2 months',
        category: 'OFFLINE',
        categoryId: offlineCategory.id,
        mentorId: mentor3.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop'
      }
    });

    // Create modules for Offline English course
    const offlineEnglishModules = [
      {
        title: '🗣️ Offline Module 1: Classroom Conversation Practice',
        videoUrl: 'https://www.youtube.com/watch?v=offline1',
        homework: `**Classroom Conversation Practice**

**Class Schedule:**
- Saturday & Monday: 4:00 PM - 6:00 PM
- Location: Campus Room 201

**In-person Activities:**
✅ Group discussions
✅ Role-playing exercises
✅ Public speaking practice
✅ Debates and presentations

**Topics Covered:**
- Daily conversation skills
- Business English
- Interview preparation
- Cultural expressions

**Classroom Features:**
- Small group size (max 15)
- Personal attention
- Real-time feedback
- Peer learning

📍 Come to campus for interactive learning`,
        order: 1,
        isLocked: false
      },
      {
        title: '🎭 Offline Module 2: Personality Development',
        videoUrl: 'https://www.youtube.com/watch?v=offline2',
        homework: `**Personality Development Workshop**

**Workshop Schedule:**
- Wednesday & Friday: 5:00 PM - 7:00 PM
- Venue: Seminar Hall A

**Face-to-face Activities:**
- Confidence building exercises
- Body language training
- Voice modulation practice
- Group dynamics

**Practical Sessions:**
- Mock interviews
- Presentation skills
- Networking practice
- Leadership activities

**Benefits:**
- Improved self-confidence
- Better communication skills
- Professional demeanor
- Enhanced social skills

🎯 Transform your personality in person`,
        order: 2,
        isLocked: false
      }
    ];

    for (const moduleData of offlineEnglishModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: offlineEnglishCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: offlineEnglishCourse.id
          }
        });
      }
    }

    // Course 4: Offline Graphics Design
    const offlineDesignCourse = await prisma.course.upsert({
      where: { slug: 'offline-graphics-design' },
      update: {},
      create: {
        title: 'Offline Graphics Design Workshop',
        slug: 'offline-graphics-design',
        description: 'Hands-on graphics design training with professional software and personal mentorship.',
        shortDescription: 'In-person design training',
        price: 9000,
        duration: '3 months',
        category: 'OFFLINE',
        categoryId: offlineCategory.id,
        mentorId: mentor3.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop'
      }
    });

    // Create modules for Offline Design course
    const offlineDesignModules = [
      {
        title: '🎨 Offline Module 1: Studio Design Practice',
        videoUrl: 'https://www.youtube.com/watch?v=offline3',
        homework: `**Studio Design Practice**

**Studio Schedule:**
- Tuesday & Thursday: 3:00 PM - 6:00 PM
- Location: Design Lab (Room 305)

**Hands-on Activities:**
✅ Software training (Photoshop, Illustrator)
✅ Drawing and sketching
✅ Portfolio development
✅ Client project simulation

**Equipment Available:**
- High-end computers
- Graphics tablets
- Professional software
- Printing facilities

**Learning Focus:**
- Design principles
- Color theory
- Typography
- Brand identity

🖥️ Access professional design tools`,
        order: 1,
        isLocked: false
      }
    ];

    for (const moduleData of offlineDesignModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: offlineDesignCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: offlineDesignCourse.id
          }
        });
      }
    }

    console.log('\n✅ Missing categories added successfully!');
    console.log('\n📚 New Categories Added:');
    console.log('1. Live Classes (2 courses)');
    console.log('   - Live BCS Crash Course');
    console.log('   - Live Programming Bootcamp');
    console.log('2. Offline Courses (2 courses)');
    console.log('   - Offline Spoken English Mastery');
    console.log('   - Offline Graphics Design Workshop');
    console.log('\n🎯 Now you have 5 categories total!');
    console.log('\n🌟 Your landing page will look amazing with all these options!');

  } catch (error) {
    console.error('Error adding missing categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingCategories();
