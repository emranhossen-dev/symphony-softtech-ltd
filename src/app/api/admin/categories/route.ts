import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For development: Return mock categories data
    // TODO: Enable database queries in production
    
    const categoryData = [
      {
        id: 'government',
        name: 'Government',
        slug: 'government',
        description: 'Government training programs',
        color: 'green',
        icon: '🏛️',
        isActive: true,
        stats: {
          totalApplications: 45,
          totalAdmitted: 32,
          totalRejected: 13,
          activeStudents: 28,
          totalRevenue: 280000,
          assignedMentors: 5
        }
      },
      {
        id: 'online',
        name: 'Online', 
        slug: 'online',
        description: 'Online training programs',
        color: 'blue',
        icon: '💻',
        isActive: true,
        stats: {
          totalApplications: 67,
          totalAdmitted: 51,
          totalRejected: 16,
          activeStudents: 45,
          totalRevenue: 450000,
          assignedMentors: 8
        }
      },
      {
        id: 'offline',
        name: 'Offline',
        slug: 'offline', 
        description: 'Offline training programs',
        color: 'purple',
        icon: '📚',
        isActive: true,
        stats: {
          totalApplications: 23,
          totalAdmitted: 18,
          totalRejected: 5,
          activeStudents: 16,
          totalRevenue: 160000,
          assignedMentors: 3
        }
      },
      {
        id: 'recorded',
        name: 'Recorded',
        slug: 'recorded',
        description: 'Recorded training programs', 
        color: 'orange',
        icon: '🎥',
        isActive: true,
        stats: {
          totalApplications: 89,
          totalAdmitted: 72,
          totalRejected: 17,
          activeStudents: 68,
          totalRevenue: 340000,
          assignedMentors: 6
        }
      }
    ];

    // Calculate stats
    const stats = {
      totalCategories: categoryData.length,
      activeCategories: categoryData.filter(cat => cat.isActive).length,
      totalCourses: categoryData.reduce((sum, cat) => sum + (cat.stats?.totalAdmitted || 0), 0),
      totalEnrollments: categoryData.reduce((sum, cat) => sum + (cat.stats?.activeStudents || 0), 0)
    };

    return NextResponse.json({
      success: true,
      categories: categoryData,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
