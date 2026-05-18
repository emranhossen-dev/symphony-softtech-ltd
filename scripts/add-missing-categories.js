const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingCategories() {
  try {
    console.log('🔍 Adding missing categories for toggler...');

    const requiredCategories = [
      {
        name: 'Live Classes',
        slug: 'live-classes',
        description: 'Interactive live online classes with real-time instruction',
        icon: 'live-classes',
        color: '#3b82f6',
        isActive: true
      },
      {
        name: 'Recorded Courses',
        slug: 'recorded-courses',
        description: 'Self-paced recorded courses you can watch anytime',
        icon: 'recorded-courses',
        color: '#8b5cf6',
        isActive: true
      },
      {
        name: 'Online Courses',
        slug: 'online-courses',
        description: 'Flexible online learning with mentor support',
        icon: 'online-courses',
        color: '#10b981',
        isActive: true
      },
      {
        name: 'Offline Courses',
        slug: 'offline-courses',
        description: 'In-person classroom training for hands-on learning',
        icon: 'offline-courses',
        color: '#f59e0b',
        isActive: true
      },
      {
        name: 'Government Courses',
        slug: 'government-courses',
        description: 'Government job preparation and competitive exams',
        icon: 'government-courses',
        color: '#ef4444',
        isActive: true
      }
    ];

    for (const categoryData of requiredCategories) {
      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });

      if (existing) {
        console.log(`✅ Category '${categoryData.name}' already exists (slug: ${categoryData.slug})`);
        continue;
      }

      // Create the category
      const category = await prisma.category.create({
        data: categoryData
      });

      console.log(`➕ Created category: ${category.name} (slug: ${category.slug})`);
    }

    console.log('🎉 All required categories are now available!');

    // Verify all categories
    const allCategories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log('\n📋 All categories in database:');
    allCategories.forEach(cat => {
      console.log(`   - ${cat.name} (slug: ${cat.slug}) - Active: ${cat.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingCategories();
