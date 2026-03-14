const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleCoursesWithModules() {
  try {
    console.log('Creating sample courses with modules...');

    // Get or create categories
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

    // Get or create admin user
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

    // Create modules for BCS course
    const bcsModules = [
      {
        title: '📚 Module 1: Bangla Language & Literature',
        videoUrl: 'https://www.youtube.com/watch?v=example1',
        homework: `**Bangla Language & Literature Assignment**

**Topics Covered:**
- Bangla Grammar Fundamentals
- Literary Analysis
- Creative Writing
- Classical Literature

**This Week's Tasks:**
✅ Read Chapter 1-3 from the textbook
✅ Complete grammar exercises (Pages 25-30)
✅ Write a short composition on "Digital Bangladesh"
✅ Join live discussion on Friday at 8 PM

**Assignment:** Write a 500-word essay on the influence of Rabindranath Tagore in modern Bangla literature.

**Due Date:** Next Sunday, 11:59 PM

**Resources:**
- Textbook: Bangla Bhasha O Sahitya
- Online lectures available in portal
- Practice papers in resource section

📞 For help: Join our study group on Messenger`,
        order: 1,
        isLocked: false
      },
      {
        title: '🧮 Module 2: Mathematics & Quantitative Aptitude',
        videoUrl: 'https://www.youtube.com/watch?v=example2',
        homework: `**Mathematics Assignment**

**Topics Covered:**
- Arithmetic and Algebra
- Geometry and Mensuration
- Statistics and Probability
- Problem Solving Techniques

**Practice Problems:**
1. Solve 20 arithmetic problems (Page 45-50)
2. Complete geometry exercises (Page 60-65)
3. Statistics practice set (Page 70-72)

**Mock Test:** This Saturday, 2:00 PM - 4:00 PM

**Important:** Bring calculator and geometry box

**Study Tips:**
- Practice daily for at least 1 hour
- Focus on speed and accuracy
- Review previous mistakes

🎯 Target: Score 80%+ in this module`,
        order: 2,
        isLocked: false
      },
      {
        title: '🌍 Module 3: General Knowledge & Current Affairs',
        videoUrl: 'https://www.youtube.com/watch?v=example3',
        homework: `**General Knowledge & Current Affairs**

**This Week's Focus:**
- International Relations
- Recent Government Policies
- Economic Developments
- Science & Technology Updates

**Daily Tasks:**
- Read newspaper headlines
- Watch news analysis videos
- Update current affairs notebook
- Practice quiz questions

**Group Discussion:** Thursday, 7:30 PM

**Topics for Discussion:**
- Climate Change Impact on Bangladesh
- Digital Economy Initiatives
- Foreign Policy Updates

**Resources:**
- Daily news summaries in portal
- Monthly current affairs magazine
- Previous year question papers

📰 Current Affairs Test: Next Monday`,
        order: 3,
        isLocked: false
      }
    ];

    for (const moduleData of bcsModules) {
      // Check if module already exists
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

    // Create modules for Web Development course
    const webModules = [
      {
        title: '🌐 Module 1: HTML5 & CSS3 Fundamentals',
        videoUrl: 'https://www.youtube.com/watch?v=example4',
        homework: `**HTML5 & CSS3 Assignment**

**Learning Objectives:**
- Master semantic HTML5 tags
- Create responsive layouts with CSS3
- Implement modern CSS techniques
- Build your first portfolio page

**Practical Tasks:**
✅ Create a personal portfolio website
✅ Implement responsive design
✅ Add animations and transitions
✅ Optimize for mobile devices

**Project Requirements:**
- Minimum 5 sections
- Fully responsive design
- Modern CSS features
- Cross-browser compatibility

**Resources:**
- HTML5 documentation
- CSS3 cheat sheets
- Design inspiration gallery
- Code review sessions

🎨 Design Review: This Friday, 6 PM`,
        order: 1,
        isLocked: false
      },
      {
        title: '⚡ Module 2: JavaScript Programming',
        videoUrl: 'https://www.youtube.com/watch?v=example5',
        homework: `**JavaScript Programming Assignment**

**Topics:**
- ES6+ JavaScript features
- DOM manipulation
- Event handling
- Async programming
- Error handling

**Coding Challenges:**
1. Build a todo application
2. Create an interactive calculator
3. Develop a weather app
4. Implement form validation

**Live Coding Sessions:**
- Tuesday & Thursday, 8 PM
- Saturday problem-solving, 3 PM

**Assessment:**
- Weekly coding challenges
- Peer code reviews
- Final project presentation

💻 Submit your GitHub repository by Sunday`,
        order: 2,
        isLocked: false
      },
      {
        title: '⚛️ Module 3: React.js & Modern Frontend',
        videoUrl: 'https://www.youtube.com/watch?v=example6',
        homework: `**React.js Development Assignment**

**React Concepts:**
- Components & Props
- State Management
- Hooks (useState, useEffect, useContext)
- Routing with React Router
- API integration

**Build Projects:**
1. E-commerce product page
2. Social media dashboard
3. Task management app
4. Real-time chat application

**Learning Resources:**
- React documentation
- Component libraries
- Best practices guide
- Performance optimization tips

**Code Review:** Every Wednesday, 7 PM

🚀 Deploy your projects to Vercel/Netlify`,
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

    // Create modules for Data Science course
    const dataModules = [
      {
        title: '🐍 Module 1: Python Programming for Data Science',
        videoUrl: 'https://www.youtube.com/watch?v=example7',
        homework: `**Python for Data Science Assignment**

**Python Topics:**
- Python basics and syntax
- NumPy for numerical computing
- Pandas for data manipulation
- Matplotlib for visualization

**Practical Exercises:**
✅ Data cleaning and preprocessing
✅ Exploratory data analysis
✅ Statistical analysis
✅ Data visualization projects

**Datasets to Work With:**
- Sales data analysis
- Customer segmentation
- Time series analysis
- Classification problems

**Tools:**
- Jupyter Notebooks
- Google Colab
- Python libraries: NumPy, Pandas, Matplotlib

📊 Submit your analysis notebooks by Friday`,
        order: 1,
        isLocked: false
      },
      {
        title: '🤖 Module 2: Machine Learning Algorithms',
        videoUrl: 'https://www.youtube.com/watch?v=example8',
        homework: `**Machine Learning Assignment**

**ML Algorithms:**
- Linear and Logistic Regression
- Decision Trees and Random Forests
- SVM and Naive Bayes
- Clustering algorithms

**Implementation Tasks:**
1. Build a classification model
2. Create a regression predictor
3. Implement clustering analysis
4. Model evaluation and tuning

**Projects:**
- Customer churn prediction
- House price prediction
- Customer segmentation
- Spam detection system

**Evaluation Metrics:**
- Accuracy, Precision, Recall
- F1 Score, ROC-AUC
- Cross-validation
- Hyperparameter tuning

🎯 Model Performance Target: 85%+ accuracy`,
        order: 2,
        isLocked: false
      },
      {
        title: '📊 Module 3: Deep Learning & Neural Networks',
        videoUrl: 'https://www.youtube.com/watch?v=example9',
        homework: `**Deep Learning Assignment**

**Neural Network Topics:**
- Introduction to neural networks
- TensorFlow and Keras
- Convolutional Neural Networks (CNN)
- Recurrent Neural Networks (RNN)

**Deep Learning Projects:**
1. Image classification with CNN
2. Text sentiment analysis
3. Time series prediction
4. Transfer learning applications

**Frameworks:**
- TensorFlow/Keras
- PyTorch basics
- Google Colab GPU usage

**Advanced Topics:**
- Transfer learning
- Model optimization
- Deployment strategies

🧠 Build and deploy at least 2 deep learning models`,
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

    // Course 4: Digital Marketing
    const marketingCourse = await prisma.course.upsert({
      where: { slug: 'digital-marketing-mastery' },
      update: {},
      create: {
        title: 'Digital Marketing Mastery',
        slug: 'digital-marketing-mastery',
        description: 'Complete digital marketing course covering SEO, social media marketing, content marketing, PPC advertising, and analytics with real-world projects.',
        shortDescription: 'Complete digital marketing with practical projects',
        price: 6000,
        duration: '3 months',
        category: 'ONLINE',
        categoryId: onlineCategory.id,
        mentorId: mentor2.id,
        createdBy: adminUser.id,
        isActive: true,
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop'
      }
    });

    // Create modules for Digital Marketing course
    const marketingModules = [
      {
        title: '🔍 Module 1: SEO & Content Marketing',
        videoUrl: 'https://www.youtube.com/watch?v=example10',
        homework: `**SEO & Content Marketing Assignment**

**SEO Topics:**
- Keyword research and analysis
- On-page and off-page SEO
- Technical SEO fundamentals
- Content strategy development

**Practical Tasks:**
✅ Conduct keyword research
✅ Optimize website content
✅ Build backlinks
✅ Create content calendar

**Tools to Learn:**
- Google Analytics
- SEMrush/Ahrefs
- Google Search Console
- Yoast SEO

**Project:** Create and execute SEO strategy for a mock website

📈 Target: Achieve top 10 ranking for chosen keywords`,
        order: 1,
        isLocked: false
      },
      {
        title: '📱 Module 2: Social Media Marketing',
        videoUrl: 'https://www.youtube.com/watch?v=example11',
        homework: `**Social Media Marketing Assignment**

**Platforms Covered:**
- Facebook & Instagram Marketing
- LinkedIn Professional Marketing
- Twitter Marketing Strategies
- YouTube Content Creation

**Campaign Tasks:**
1. Create social media strategy
2. Design engaging content
3. Run ad campaigns
4. Analyze performance metrics

**Content Creation:**
- Post scheduling
- Community management
- Influencer collaboration
- Video content strategy

📱 Build a social media presence for a brand`,
        order: 2,
        isLocked: false
      }
    ];

    for (const moduleData of marketingModules) {
      const existingModule = await prisma.module.findFirst({
        where: {
          courseId: marketingCourse.id,
          title: moduleData.title
        }
      });

      if (!existingModule) {
        await prisma.module.create({
          data: {
            ...moduleData,
            courseId: marketingCourse.id
          }
        });
      }
    }

    console.log('\n✅ Sample courses with modules created successfully!');
    console.log('\n📚 Courses Created:');
    console.log('1. BCS Preparation Complete Course (Government)');
    console.log('2. Full Stack Web Development Bootcamp (Online)');
    console.log('3. Data Science Fundamentals (Recorded)');
    console.log('4. Digital Marketing Mastery (Online)');
    console.log('\n🎯 Each course has 2-3 modules with detailed content!');
    console.log('\n🌟 These courses will look great on your landing page!');

  } catch (error) {
    console.error('Error creating sample courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleCoursesWithModules();
