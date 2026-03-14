"use client";

import { useState, useEffect } from 'react';
import { Star, Users, Clock, TrendingUp, Award, Play, Zap, Heart, ArrowRight } from "lucide-react";
import { formatBDT } from '@/lib/currency';

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  category: string;
  price: number;
  duration: string;
  level: string;
  isActive: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
}

const FeaturedCoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/courses?featured=true&limit=6');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching featured courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
          />
        ))}
      </div>
    );
  };

  const handleCourseClick = (courseId: string) => {
    window.location.href = `/course/${courseId}`;
  };

  if (loading) {
    return (
      <section className="relative py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full text-blue-300 mb-8 border border-blue-400/30">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">FEATURED COURSES</span>
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Featured
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                Courses
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto">
              Discover our most popular courses loved by thousands of students
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full text-blue-300 mb-8 border border-blue-400/30">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">FEATURED COURSES</span>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Featured
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
              Courses
            </span>
          </h2>
          
          <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Discover our most popular courses loved by thousands of students worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className="relative bg-gradient-to-br from-indigo-950 via-purple-950 to-black backdrop-blur-2xl rounded-3xl border border-purple-500/20 overflow-hidden hover:scale-[1.03] transition-all duration-700 cursor-pointer shadow-2xl hover:shadow-purple-500/30"
                onClick={() => handleCourseClick(course.id)}
              >
                {/* Animated Gradient Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                
                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-600/30 to-transparent rounded-br-3xl"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-600/30 to-transparent rounded-bl-3xl"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-600/30 to-transparent rounded-tr-3xl"></div>
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 blur-md"></div>
                    <div className="relative inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>HOT</span>
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="px-3 py-1.5 bg-black/50 backdrop-blur-xl text-purple-300 text-xs font-bold rounded-full border border-purple-400/50">
                    {course.category}
                  </div>
                </div>

                {/* Course Image with Unique Frame */}
                <div className="relative h-48 overflow-hidden mx-4 mt-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl"></div>
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-2xl flex items-center justify-center">
                      <Award className="w-16 h-16 text-purple-400/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
                </div>

                <div className="p-6 relative z-10">
                  {/* Rating with Stars */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(course.rating)}
                      </div>
                      <span className="text-xs text-purple-300">({course.reviewCount})</span>
                    </div>
                    <div className="px-2 py-1 bg-green-500/20 rounded-full border border-green-400/30">
                      <span className="text-xs text-green-400 font-bold">BESTSELLER</span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-blue-400 transition-all duration-500">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-purple-200/70 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {course.shortDescription || course.description}
                  </p>

                  {/* Unique Metadata Layout */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-700/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-purple-400">Duration</div>
                        <div className="text-sm text-white font-medium">{course.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600/30 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-purple-400">Students</div>
                        <div className="text-sm text-white font-medium">{course.enrollmentCount}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-600/30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-purple-400">Level</div>
                        <div className="text-sm text-white font-medium">{course.level}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-white mb-1">
                        {formatBDT(course.price)}
                      </div>
                      <div className="text-xs text-purple-400 line-through">৳15,999</div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-lg rounded-full"></div>
                      <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transition-all duration-300 cursor-pointer">
                        <Play className="w-4 h-4 text-white" />
                        <span className="text-white font-bold">ENROLL NOW</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
                <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => window.location.href = '/courses'}>
                  <Award className="w-5 h-5" />
                  <span>View All Courses</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-white/60 mt-4">Explore {courses.length}+ premium courses</p>
              </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
