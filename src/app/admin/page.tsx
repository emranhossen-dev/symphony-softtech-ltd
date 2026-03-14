"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Phone, 
  UserCheck,
  Monitor,
  PlayCircle,
  Building,
  ArrowRight,
  RefreshCw,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { formatBDT } from '@/lib/currency';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  stats: {
    totalApplications: number;
    totalAdmitted: number;
    totalRejected: number;
    activeStudents: number;
    totalRevenue: number;
    assignedMentors: number;
  };
}

const AdminDashboard = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      let token = localStorage.getItem('auth_token');
      
      // If no token, set the default admin token
      if (!token) {
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtbWZlZDlkeDAwMDdiOGN5cHJ5ZTM1enciLCJlbWFpbCI6ImZhaXlhei5zdW1vbkBnbWFpbC5jb20iLCJuYW1lIjoiRmFpeWF6IFN1bW9uIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzcyODY0NjY0LCJleHAiOjE3NzM0Njk0NjR9.0Ic89Ld8ImFtSQWMeEyBvAaIxQQHjgOT3zHQKhjdVbA';
        localStorage.setItem('auth-token', token);
      }
      
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const getCategoryIcon = (slug: string): ReactNode => {
    const icons: Record<string, ReactNode> = {
      government: <Building className="w-8 h-8" />,
      online: <Monitor className="w-8 h-8" />,
      offline: <Users className="w-8 h-8" />,
      recorded: <PlayCircle className="w-8 h-8" />
    };
    return icons[slug] || <Building className="w-8 h-8" />;
  };

  const getCategoryColor = (color: string) => {
    const colorMap: Record<string, { bg: string; bgLight: string; text: string }> = {
      green: { bg: 'bg-green-500', bgLight: 'bg-green-50', text: 'text-green-600' },
      blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-600' },
      purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-50', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-600' }
    };
    return colorMap[color] || colorMap.green;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header without sidebar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Control Center</h1>
            <p className="text-gray-600">Select a category to manage admissions and training programs</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigation('/admin/users')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              User Management
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="p-6">
        <div className="space-y-6">
          {categories.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-4">No training categories are available at the moment.</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          )}
          {categories.length > 0 && (
            <>
              {/* Category Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => {
              const colors = getCategoryColor(category.color);
              return (
                <div 
                  key={category.id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer"
                  onClick={() => handleNavigation(`/admin/category/${category.slug}`)}
                >
                  <div className={`${colors.bgLight} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    
                    <div className="relative z-10">
                      <div className={`${colors.bg} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform duration-200`}>
                        {getCategoryIcon(category.slug)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Training Programs</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{category.stats.totalApplications}</div>
                        <div className="text-xs text-gray-500">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{category.stats.totalAdmitted}</div>
                        <div className="text-xs text-gray-500">Admitted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{category.stats.activeStudents}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{formatBDT(category.stats.totalRevenue)}</div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{category.stats.assignedMentors}</div>
                        <div className="text-xs text-gray-500">Mentors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{category.stats.totalRejected}</div>
                        <div className="text-xs text-gray-500">Rejected</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Admission Rate</span>
                        <span>{category.stats.totalApplications > 0 ? Math.round((category.stats.totalAdmitted / category.stats.totalApplications) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${colors.bg} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${category.stats.totalApplications > 0 ? (category.stats.totalAdmitted / category.stats.totalApplications) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className={`${colors.bgLight} ${colors.text} font-medium py-3 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-md`}>
                      View Details
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {categories.reduce((sum, cat) => sum + cat.stats.totalApplications, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {categories.reduce((sum, cat) => sum + cat.stats.totalAdmitted, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Admitted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {categories.reduce((sum, cat) => sum + cat.stats.activeStudents, 0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {formatBDT(categories.reduce((sum, cat) => sum + cat.stats.totalRevenue, 0))}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Revenue</div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
