"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Users, BookOpen, TrendingUp, Calendar, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  duration: string;
  students: number;
}

interface Enrollment {
  id: string;
  studentName: string;
  enrolledAt: string;
  progress: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  courseCount: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
  courses?: Course[];
  enrollments?: Enrollment[];
}

export default function CategoryDetails() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'enrollments'>('courses');

  useEffect(() => {
    if (params.slug) {
      fetchCategoryDetails(params.slug as string);
    }
  }, [params.slug]);

  const fetchCategoryDetails = async (categoryId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.category);
      } else {
        toast.error(data.error || 'Failed to fetch category details');
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
      toast.error('Failed to fetch category details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Category not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-8 py-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Category Details</h1>
              <p className="text-sm text-gray-500 mt-1">View and manage category information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Category Info */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                <Badge className={category.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Courses:</span>
                    <span className="font-medium">{category.courseCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Enrollments:</span>
                    <span className="font-medium">{category.enrollmentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(category.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'courses'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Courses ({category.courses?.length || 0})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('enrollments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'enrollments'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Enrollments ({category.enrollments?.length || 0})
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'courses' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Courses in this Category</h3>
                  {category.courses?.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{course.title}</h4>
                          <p className="text-sm text-gray-600">Duration: {course.duration}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            {course.students} students
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'enrollments' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Enrollments</h3>
                  {category.enrollments?.map((enrollment) => (
                    <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{enrollment.studentName}</h4>
                          <p className="text-sm text-gray-600">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Progress</div>
                            <div className="text-lg font-medium">{enrollment.progress}%</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
