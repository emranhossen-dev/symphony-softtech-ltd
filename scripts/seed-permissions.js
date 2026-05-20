const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultPermissions = [
  // Management
  {
    key: 'dashboard',
    name: 'Dashboard',
    description: 'View admin dashboard',
    category: 'Management',
    icon: 'LayoutDashboard',
    route: '/admin'
  },
  {
    key: 'users',
    name: 'Users & Employees',
    description: 'Manage users and employees',
    category: 'Management',
    icon: 'Users',
    route: '/admin/users'
  },
  {
    key: 'settings',
    name: 'Settings',
    description: 'System settings',
    category: 'Management',
    icon: 'Settings',
    route: '/admin/settings'
  },

  // Education
  {
    key: 'enrollments',
    name: 'Enrollments',
    description: 'Manage student enrollments',
    category: 'Education',
    icon: 'UserCheck',
    route: '/admin/enrollments'
  },
  {
    key: 'courses',
    name: 'Courses',
    description: 'Manage courses and modules',
    category: 'Education',
    icon: 'BookOpen',
    route: '/admin/courses'
  },
  {
    key: 'categories',
    name: 'Categories',
    description: 'Manage course categories',
    category: 'Education',
    icon: 'Folder',
    route: '/admin/categories'
  },
  {
    key: 'students',
    name: 'Students',
    description: 'Student management',
    category: 'Education',
    icon: 'GraduationCap',
    route: '/admin/students'
  },
  {
    key: 'mentors',
    name: 'Mentors',
    description: 'Mentor management',
    category: 'Education',
    icon: 'User',
    route: '/admin/mentors'
  },

  // Finance
  {
    key: 'payments',
    name: 'Payments',
    description: 'View payment history',
    category: 'Finance',
    icon: 'CreditCard',
    route: '/admin/payments'
  },
  {
    key: 'revenue',
    name: 'Revenue',
    description: 'Revenue tracking',
    category: 'Finance',
    icon: 'DollarSign',
    route: '/admin/revenue'
  },

  // Analytics
  {
    key: 'reports',
    name: 'Reports',
    description: 'View analytics and reports',
    category: 'Analytics',
    icon: 'BarChart',
    route: '/admin/reports'
  },
  {
    key: 'statistics',
    name: 'Statistics',
    description: 'View statistics',
    category: 'Analytics',
    icon: 'TrendingUp',
    route: '/admin/statistics'
  }
];

async function seedPermissions() {
  try {
    console.log('🌱 Seeding permissions...');

    for (const permission of defaultPermissions) {
      const existing = await prisma.permission.findUnique({
        where: { key: permission.key }
      });

      if (!existing) {
        await prisma.permission.create({
          data: permission
        });
        console.log(`✅ Created permission: ${permission.name}`);
      } else {
        console.log(`⏭️  Permission already exists: ${permission.name}`);
      }
    }

    console.log('🎉 Permissions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedPermissions();
