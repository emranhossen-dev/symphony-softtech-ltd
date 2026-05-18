"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Users, Clock, TrendingUp, Award, Play, ArrowRight, Loader2, BookOpen, Zap } from "lucide-react";
import { formatBDT } from '@/lib/currency';
import Counter from "@/components/Counter";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [coursesByCategory, setCoursesByCategory] = useState<Record<string, Course[]>>({});
  const [loading, setLoading] = useState(true);

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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 glass-button px-6 py-3 rounded-full text-blue-400 mb-8">
              <BookOpen className="w-5 h-5" />
              <span className="font-bold">OUR COURSES</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Explore by
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
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
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Explore by
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Category
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">Loading courses...</p>
          <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="relative text-center mb-20">
          {/* Badge */}
          <div className="relative inline-flex items-center gap-3 glass-button px-8 py-4 rounded-full mb-8">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-blue-400 tracking-wide">DISCOVER OUR PROGRAMS</span>
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Main Title */}
          <h2 className="relative text-6xl md:text-7xl font-bold mb-8">
            <span className="text-white">Explore by</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient">
              Category
            </span>
          </h2>
          
          {/* Description */}
          <p className="relative text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            Choose from our carefully curated courses designed to help you 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold"> achieve your goals</span>
          </p>

          {/* Stats Bar */}
          <div className="relative flex justify-center gap-12 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400"><Counter end={categories.length} /></div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Categories</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                <Counter end={Object.values(coursesByCategory).reduce((total, courses) => total + courses.length, 0)} />
              </div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Courses</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400"><Counter end={5000} suffix="+" /></div>
              <div className="text-sm text-gray-400 uppercase tracking-wide">Students</div>
            </div>
          </div>
        </div>

        {/* Category Tab Switcher */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 p-2 glass-button rounded-2xl max-w-4xl mx-auto">
            {categories.map((category) => {
              const categoryCourses = coursesByCategory[category.name] || [];
              
              return (
                <button
                  key={category.slug}
                  onClick={() => router.push(`/courses?category=${category.slug}`)}
                  className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 bg-blue-900/30 text-gray-300 hover:bg-blue-900/50 hover:scale-105`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-lg">{category.name}</span>
                  {categoryCourses.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-800/50">
                      {categoryCourses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Learning Journey?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 6,300+ students already learning
            </p>
            <button 
              onClick={() => router.push('/courses')}
              className="glass-button px-8 py-4 rounded-full font-bold hover:scale-105 transition-all duration-300 text-blue-400 border-2 border-blue-500/50"
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
