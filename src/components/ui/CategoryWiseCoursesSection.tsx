"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Users, Clock, TrendingUp, Award, Play, ArrowRight, Loader2, BookOpen, Zap } from "lucide-react";
import { formatBDT } from '@/lib/currency';

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  category: string;
  categorySlug: string;
  price: number;
  duration: string;
  level: string;
  isActive: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
}

interface Category {
  name: string;
  slug: string;
  color: string;
  icon: string;
}

const CategoryWiseCoursesSection = () => {
  const router = useRouter();
  const [coursesByCategory, setCoursesByCategory] = useState<{ [key: string]: Course[] }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Helper functions - moved here before use
  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500', 
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ];
    return colors[index % colors.length];
  };

  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.toLowerCase().includes('government')) return '🏛️';
    if (categoryName.toLowerCase().includes('online')) return '💻';
    if (categoryName.toLowerCase().includes('offline')) return '🏫';
    if (categoryName.toLowerCase().includes('recorded')) return '🎥';
    return '📚';
  };

  useEffect(() => {
    fetchCoursesByCategory();
  }, []);

  const fetchCoursesByCategory = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching courses by category...');
      
      // Fetch all active courses
      const response = await fetch('/api/public/courses?limit=20');
      const data = await response.json();
      
      console.log('📦 API Response:', data);
      
      if (data.success && data.courses) {
        console.log(`✅ Found ${data.courses.length} courses`);
        
        // Group courses by category
        const grouped = data.courses.reduce((acc: { [key: string]: Course[] }, course: Course) => {
          if (!acc[course.category]) {
            acc[course.category] = [];
          }
          acc[course.category].push(course);
          return acc;
        }, {});

        console.log('📂 Grouped courses:', Object.keys(grouped));

        // Get unique categories with colors
        const uniqueCategories = Array.from(new Set(data.courses.map((course: Course) => course.category)) as unknown as string[])
          .map((catName: string, index) => ({
            name: catName,
            slug: data.courses.find((c: Course) => c.category === catName)?.categorySlug || catName.toLowerCase(),
            color: getCategoryColor(index),
            icon: getCategoryIcon(catName)
          }));

        console.log('🏷️ Unique categories:', uniqueCategories);

        setCoursesByCategory(grouped);
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setSelectedCategory(uniqueCategories[0].name);
        }
        console.log('✅ Data set successfully');
      } else {
        console.error('❌ API returned error:', data.error || 'No courses data');
      }
    } catch (error) {
      console.error('❌ Error fetching courses by category:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  if (loading) {
    console.log('⏳ Showing loading state...');
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full text-blue-600 mb-8 border border-blue-400/30">
              <BookOpen className="w-5 h-5" />
              <span className="font-bold">OUR COURSES</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Explore by
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Category
              </span>
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  console.log('📊 Categories loaded:', categories.length);
  console.log('📊 Courses by category:', Object.keys(coursesByCategory));

  if (categories.length === 0) {
    console.log('❌ No categories found, showing fallback');
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Explore by
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Category
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">Loading courses...</p>
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50"></div>
      <div className="absolute top-20 left-10 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      
      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="relative text-center mb-20">
          {/* Background Decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-9xl font-bold text-gray-900">COURSES</div>
          </div>
          
          {/* Badge */}
          <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-violet-600/10 to-pink-600/10 backdrop-blur-md px-8 py-4 rounded-full mb-8 border border-violet-200/50 shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full animate-pulse"></div>
            <span className="font-semibold text-violet-700 tracking-wide">DISCOVER OUR PROGRAMS</span>
            <div className="w-2 h-2 bg-gradient-to-r from-pink-600 to-violet-600 rounded-full animate-pulse"></div>
          </div>
          
          {/* Main Title */}
          <h2 className="relative text-6xl md:text-7xl font-bold mb-8">
            <span className="text-gray-900">Explore by</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 animate-gradient">
              Category
            </span>
          </h2>
          
          {/* Description */}
          <p className="relative text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            Choose from our carefully curated courses designed to help you 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 font-semibold"> achieve your goals</span>
          </p>

          {/* Stats Bar */}
          <div className="relative flex justify-center gap-12 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-600">{categories.length}</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Categories</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Object.values(coursesByCategory).reduce((total, courses) => total + courses.length, 0)}
              </div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Courses</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">5000+</div>
              <div className="text-sm text-gray-600 uppercase tracking-wide">Students</div>
            </div>
          </div>
        </div>

        {/* Category Tab Switcher */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 p-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
            {categories.map((category) => {
              const isSelected = selectedCategory === category.name;
              const categoryCourses = coursesByCategory[category.name] || [];
              
              return (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    isSelected
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg transform scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  {categoryCourses.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isSelected ? 'bg-white/20' : 'bg-gray-300'
                    }`}>
                      {categoryCourses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Courses */}
        {categories.map((category) => {
          if (category.name !== selectedCategory) return null;
          
          const categoryCourses = coursesByCategory[category.name] || [];
          
          if (categoryCourses.length === 0) return null;

          return (
            <div key={category.slug} className="category-section">
              {/* Category Header */}
              <div className="text-center mb-12">
                <div className={`relative inline-flex items-center gap-4 bg-gradient-to-r ${category.color} text-white px-12 py-6 rounded-2xl mb-6 shadow-2xl transform transition-all duration-500 hover:scale-105`}>
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-2xl blur-xl opacity-50 animate-pulse`}></div>
                  
                  <div className="relative text-4xl filter drop-shadow-lg">{category.icon}</div>
                  <div className="relative">
                    <h3 className="text-3xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90 font-medium">{categoryCourses.length} courses available</p>
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
                    onClick={() => handleCourseClick(course.id)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                      {/* Gradient Border Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      
                      {/* Course Image */}
                      <div className="relative h-56 overflow-hidden">
                        {course.thumbnail ? (
                          <>
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          </>
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${category.color} opacity-20 flex items-center justify-center`}>
                            <BookOpen className="w-20 h-20 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Featured Badge */}
                        {course.featured && (
                          <div className="absolute top-4 left-4">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                FEATURED
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {category.name}
                          </div>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        {/* Rating */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {renderStars(course.rating)}
                            <span className="text-sm text-gray-500">({course.reviewCount})</span>
                          </div>
                          {course.featured && (
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                              POPULAR
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">
                          {course.title}
                        </h4>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.shortDescription || course.description}
                        </p>

                        {/* Course Details */}
                        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{course.enrollmentCount} students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{course.level}</span>
                          </div>
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {formatBDT(course.price)}
                            </div>
                            {course.price > 0 && (
                              <div className="text-sm text-gray-500 line-through">৳{Math.floor(course.price * 1.5)}</div>
                            )}
                          </div>
                          
                          <button className={`relative group/btn px-6 py-3 bg-gradient-to-r ${category.color} text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105`}>
                            <span className="flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              View Course
                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button for Category */}
              <div className="text-center mt-12">
                <button 
                  onClick={() => router.push(`/courses?category=${category.slug}`)}
                  className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${category.color} text-white rounded-full font-semibold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105`}
                >
                  <BookOpen className="w-5 h-5" />
                  View All {category.name} Courses
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Learning Journey?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning and advancing their careers
            </p>
            <button 
              onClick={() => router.push('/courses')}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105"
            >
              Explore All Courses
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryWiseCoursesSection;
