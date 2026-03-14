'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, BookOpen, Activity, Calendar, Download, Filter, BarChart3, PieChart, LineChart, Eye, Clock, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { formatBDT } from '@/lib/currency';
import toast from 'react-hot-toast';

interface AnalyticsData {
  enrollmentGrowth: Array<{
    month: string;
    enrollments: number;
    revenue: number;
  }>;
  revenueGrowth: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  activeUsers: {
    total: number;
    active: number;
    inactive: number;
    growth: number;
    daily: Array<{
      date: string;
      active: number;
      total: number;
    }>;
  };
  summary: {
    totalEnrollments: number;
    totalRevenue: number;
    totalUsers: number;
    avgRevenuePerUser: number;
    conversionRate: number;
    growthRate: number;
  };
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedChart, setSelectedChart] = useState<'overview' | 'enrollment' | 'revenue' | 'categories' | 'users'>('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?timeRange=${timeRange}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}.csv`;
      a.click();
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUp className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.summary.totalEnrollments)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(analyticsData.summary.growthRate)}
                <span className={`ml-1 text-sm ${getGrowthColor(analyticsData.summary.growthRate)}`}>
                  {Math.abs(analyticsData.summary.growthRate)}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.summary.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(analyticsData.summary.growthRate)}
                <span className={`ml-1 text-sm ${getGrowthColor(analyticsData.summary.growthRate)}`}>
                  {Math.abs(analyticsData.summary.growthRate)}%
                </span>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">৳</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.activeUsers.active)}</p>
              <div className="flex items-center mt-2">
                <Eye className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-600">
                  {Math.round((analyticsData.activeUsers.active / analyticsData.activeUsers.total) * 100)}% of total
                </span>
              </div>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Revenue/User</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.summary.avgRevenuePerUser)}</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(analyticsData.summary.growthRate)}
                <span className={`ml-1 text-sm ${getGrowthColor(analyticsData.summary.growthRate)}`}>
                  {Math.abs(analyticsData.summary.growthRate)}%
                </span>
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.summary.conversionRate}%</p>
              <div className="flex items-center mt-2">
                {getGrowthIcon(analyticsData.summary.growthRate)}
                <span className={`ml-1 text-sm ${getGrowthColor(analyticsData.summary.growthRate)}`}>
                  {Math.abs(analyticsData.summary.growthRate)}%
                </span>
              </div>
            </div>
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'enrollment', label: 'Enrollment Growth', icon: Users },
              { id: 'revenue', label: 'Revenue Growth', icon: () => <span className="text-xl">৳</span> },
              { id: 'categories', label: 'Category Distribution', icon: PieChart },
              { id: 'users', label: 'Active Users', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedChart(tab.id as any)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                  selectedChart === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          {/* Overview Chart */}
          {selectedChart === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment & Revenue Trend</h3>
                <div className="h-64 bg-gray-50 rounded-lg p-4">
                  <div className="h-full flex items-center justify-center">
                    <LineChart className="w-8 h-8 text-gray-400" />
                    <p className="text-gray-500 ml-2">Line chart showing enrollment and revenue trends</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Monthly Growth Rate</span>
                    <span className="font-semibold">{analyticsData.summary.growthRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">User Retention</span>
                    <span className="font-semibold">
                      {analyticsData.activeUsers.total > 0 ? Math.round((analyticsData.activeUsers.active / analyticsData.activeUsers.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Course Completion</span>
                    <span className="font-semibold">
                      {analyticsData.summary.totalEnrollments > 0 ? Math.round((analyticsData.activeUsers.active / analyticsData.summary.totalEnrollments) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enrollment Growth Chart */}
          {selectedChart === 'enrollment' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Growth</h3>
              <div className="h-96 bg-gray-50 rounded-lg p-4">
                <div className="h-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                  <p className="text-gray-500 ml-2">
                    {analyticsData.enrollmentGrowth.length > 0 ? 'Bar chart showing monthly enrollment growth' : 'No enrollment data available'}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.enrollmentGrowth.slice(-3).map((data, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{data.month}</p>
                    <p className="text-lg font-semibold">{formatNumber(data.enrollments)}</p>
                    <p className={`text-xs ${data.enrollments > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {data.enrollments > 0 ? '+' : ''}{Math.round((data.enrollments / (analyticsData.enrollmentGrowth[index - 1]?.enrollments || 1) - 1) * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenue Growth Chart */}
          {selectedChart === 'revenue' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth</h3>
              <div className="h-96 bg-gray-50 rounded-lg p-4">
                <div className="h-full flex items-center justify-center">
                  <LineChart className="w-8 h-8 text-gray-400" />
                  <p className="text-gray-500 ml-2">
                    {analyticsData.revenueGrowth.length > 0 ? 'Line chart showing monthly revenue growth' : 'No revenue data available'}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.revenueGrowth.slice(-3).map((data, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">{data.month}</p>
                    <p className="text-lg font-semibold">{formatCurrency(data.revenue)}</p>
                    <p className={`text-xs ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.growth >= 0 ? '+' : ''}{Math.round(data.growth)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Distribution Chart */}
          {selectedChart === 'categories' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80 bg-gray-50 rounded-lg p-4">
                  <div className="h-full flex items-center justify-center">
                    <PieChart className="w-8 h-8 text-gray-400" />
                    <p className="text-gray-500 ml-2">
                      {analyticsData.categoryDistribution.length > 0 ? 'Pie chart showing course category distribution' : 'No category data available'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Category Breakdown</h4>
                  <div className="space-y-2">
                    {analyticsData.categoryDistribution.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(category.count)}</p>
                          <p className="text-sm text-gray-600">{category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Users Chart */}
          {selectedChart === 'users' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">User Activity</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-green-700">Active Users</span>
                      <span className="font-semibold text-green-900">{formatNumber(analyticsData.activeUsers.active)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-red-700">Inactive Users</span>
                      <span className="font-semibold text-red-900">{formatNumber(analyticsData.activeUsers.inactive)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="text-blue-700">Total Users</span>
                      <span className="font-semibold text-blue-900">{formatNumber(analyticsData.activeUsers.total)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Daily Activity</h4>
                  <div className="h-64 bg-gray-50 rounded-lg p-4">
                    <div className="h-full flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                      <p className="text-gray-500 ml-2">
                        {analyticsData.activeUsers.daily.length > 0 ? 'Bar chart showing daily active users' : 'No user activity data available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
