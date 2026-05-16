const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCategories() {
  try {
    console.log('Starting category fix...');

    // 1. Ensure all required categories exist
    const requiredCategories = [
      { name: 'Government Courses', slug: 'government', description: 'Government job preparation courses', color: '#10b981', icon: '🏛️' },
      { name: 'Online Courses', slug: 'online', description: 'Online self-paced courses', color: '#3b82f6', icon: '💻' },
      { name: 'Offline Courses', slug: 'offline', description: 'Classroom-based courses', color: '#f59e0b', icon: '🏫' },
      { name: 'Recorded Courses', slug: 'recorded', description: 'Pre-recorded video courses', color: '#8b5cf6', icon: '🎥' }
    ];

    console.log('Creating required categories...');
    for (const catData of requiredCategories) {
      await prisma.category.upsert({
        where: { slug: catData.slug },
        update: catData,
        create: catData
      });
    }

    // 2. Get all categories for mapping
    const categories = await prisma.category.findMany();
    const categoryMap = {
      'GOVERNMENT': categories.find(c => c.slug === 'government'),
      'ONLINE': categories.find(c => c.slug === 'online'),
      'OFFLINE': categories.find(c => c.slug === 'offline'),
      'RECORDED': categories.find(c => c.slug === 'recorded'),
      'government': categories.find(c => c.slug === 'government'),
      'online': categories.find(c => c.slug === 'online'),
      'offline': categories.find(c => c.slug === 'offline'),
      'recorded': categories.find(c => c.slug === 'recorded')
    };

    // 3. Fix courses without proper categoryId
    console.log('Fixing courses without category relationships...');
    const coursesToFix = await prisma.course.findMany({
      where: {
        categoryId: null
      }
    });

    console.log(`Found ${coursesToFix.length} courses to fix`);

    for (const course of coursesToFix) {
      const category = categoryMap[course.category];
      if (category) {
        await prisma.course.update({
          where: { id: course.id },
          data: { categoryId: category.id }
        });
        console.log(`Fixed course: ${course.title} -> ${category.name}`);
      } else {
        console.log(`No category mapping found for course: ${course.title} (${course.category})`);
      }
    }

    // 4. Update any courses with incorrect category strings
    console.log('Updating courses with incorrect category strings...');
    const allCourses = await prisma.course.findMany();
    
    for (const course of allCourses) {
      let targetCategory = null;
      
      // Map various category string formats to standard ones
      if (course.category?.toLowerCase().includes('gov')) {
        targetCategory = categoryMap['GOVERNMENT'];
      } else if (course.category?.toLowerCase().includes('online')) {
        targetCategory = categoryMap['ONLINE'];
      } else if (course.category?.toLowerCase().includes('offline')) {
        targetCategory = categoryMap['OFFLINE'];
      } else if (course.category?.toLowerCase().includes('record')) {
        targetCategory = categoryMap['RECORDED'];
      } else {
        // Try direct mapping
        targetCategory = categoryMap[course.category];
      }

      if (targetCategory && course.categoryId !== targetCategory.id) {
        await prisma.course.update({
          where: { id: course.id },
          data: { 
            categoryId: targetCategory.id,
            category: targetCategory.slug.toUpperCase()
          }
        });
        console.log(`Updated course: ${course.title} -> ${targetCategory.name}`);
      }
    }

    console.log('Category fix completed successfully!');
    
    // 5. Summary
    const fixedCourses = await prisma.course.findMany({
      where: { categoryId: { not: null } },
      include: { categoryRelation: true }
    });
    
    console.log(`\nSummary: ${fixedCourses.length} courses now have proper category relationships`);
    
    const uncategorizedCount = await prisma.course.count({
      where: { categoryId: null }
    });
    
    if (uncategorizedCount > 0) {
      console.log(`Warning: ${uncategorizedCount} courses still uncategorized`);
    } else {
      console.log('Success: All courses are now properly categorized!');
    }

  } catch (error) {
    console.error('Error fixing categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCategories();
