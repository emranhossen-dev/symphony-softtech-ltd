import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(request: NextRequest) {
  try {
    // Check if prisma is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch enrollment data
    const enrollments = await prisma.enrollment.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        enrollmentStatus: 'ADMITTED'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Fetch payment data
    const payments = await prisma.payment.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Fetch user data
    const users = await (prisma as any).user.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Process enrollment growth data
    const enrollmentGrowth = processMonthlyData(enrollments, 'createdAt', (item) => ({
      month: item.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      enrollments: 1,
      revenue: 0
    }));

    // Process revenue growth data
    const revenueGrowth = processMonthlyData(payments, 'createdAt', (item) => ({
      month: item.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      revenue: item.amount || 0,
      growth: 0 // Will be calculated
    }));

    // Calculate revenue growth rates
    revenueGrowth.forEach((item, index) => {
      if (index > 0) {
        const prevRevenue = revenueGrowth[index - 1].revenue;
        item.growth = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue) * 100 : 0;
      }
    });

    // Process category distribution
    const categoryMap = new Map<string, number>();
    enrollments.forEach(enrollment => {
      const category = enrollment.categoryId || 'Other';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / enrollments.length) * 100),
      color: getCategoryColor(category)
    }));

    // Process active users data
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter((user: any) => 
      user.lastLoginAt && user.lastLoginAt > thirtyDaysAgo
    ).length;
    
    const inactiveUsers = users.length - activeUsers;
    const totalUsers = users.length;
    const growthRate = users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0;

    // Process daily active users
    const dailyActiveUsers = processDailyData(users, 'lastLoginAt');

    // Calculate summary statistics
    const totalEnrollments = enrollments.length;
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    const conversionRate = users.length > 0 ? Math.round((enrollments.length / users.length) * 100) : 0;
    const overallGrowthRate = revenueGrowth.length > 1 ? 
      Math.round(((revenueGrowth[revenueGrowth.length - 1].revenue - revenueGrowth[0].revenue) / revenueGrowth[0].revenue) * 100) : 0;

    const analytics = {
      enrollmentGrowth,
      revenueGrowth,
      categoryDistribution,
      activeUsers: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        growth: growthRate,
        daily: dailyActiveUsers
      },
      summary: {
        totalEnrollments,
        totalRevenue,
        totalUsers,
        avgRevenuePerUser,
        conversionRate,
        growthRate: overallGrowthRate
      }
    };

    return NextResponse.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { timeRange } = await request.json();

    // In a real application, you'd implement scheduled report generation
    // and email delivery to administrators
    
    return NextResponse.json({
      success: true,
      message: 'Analytics report scheduled for generation',
      timeRange
    });
  } catch (error) {
    console.error('Error scheduling analytics report:', error);
    return NextResponse.json(
      { error: 'Failed to schedule analytics report' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Helper function to process monthly data
function processMonthlyData<T extends { createdAt: Date }>(
  data: T[], 
  dateField: keyof T, 
  mapper: (item: T) => any
) {
  const monthlyMap = new Map<string, any>();
  
  data.forEach(item => {
    const date = item[dateField] as Date;
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        month: monthKey,
        ...mapper(item),
        count: 0
      });
    }
    
    const existing = monthlyMap.get(monthKey);
    existing.count++;
    if (typeof existing.enrollments === 'number') {
      existing.enrollments++;
    } else if (typeof existing.revenue === 'number') {
      existing.revenue += mapper(item).revenue || 0;
    }
  });

  return Array.from(monthlyMap.values());
}

// Helper function to process daily data
function processDailyData<T extends { lastLoginAt?: Date }>(
  data: T[], 
  dateField: keyof T
) {
  const dailyMap = new Map<string, number>();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Initialize last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = date.toLocaleDateString();
    dailyMap.set(dateKey, 0);
  }
  
  data.forEach(item => {
    const lastLogin = item[dateField] as Date;
    if (lastLogin) {
      const dateKey = lastLogin.toLocaleDateString();
      if (dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, dailyMap.get(dateKey)! + 1);
      }
    }
  });

  return Array.from(dailyMap.entries()).map(([date, active]) => ({
    date,
    active,
    total: data.length
  }));
}

// Helper function to get category colors
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Web Development': '#3B82F6',
    'Mobile Development': '#10B981',
    'Data Science': '#F59E0B',
    'Design': '#EF4444',
    'Marketing': '#8B5CF6',
    'Business': '#6366F1',
    'Photography': '#EC4899',
    'Other': '#6B7280'
  };
  return colors[category] || '#6B7280';
}
