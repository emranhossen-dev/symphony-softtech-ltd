"use client";

import { useState, useEffect } from 'react';
import { formatBDT } from '@/lib/currency';
import GovtRegistrationForm from "@/components/ui/GovtRegistrationForm";
import EnrollmentForm from "@/components/enrollment/EnrollmentForm";
import { Award, Users, Clock, Target, Star, TrendingUp, Shield, BookOpen, X } from "lucide-react";

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
  createdAt: string;
}

const GovernmentCategoryPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    fetchGovernmentCourses();
  }, []);

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const handleCloseModal = () => {
    setShowEnrollModal(false);
    setSelectedCourse(null);
  };

  const fetchGovernmentCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses?category=GOVERNMENT');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching government courses:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Enhanced Page Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20"></div>
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center py-20">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full text-blue-300 mb-8 border border-blue-400/30">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">GOVERNMENT SECTOR EXCELLENCE</span>
              <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400">
                Government
              </span>
              <span className="block text-4xl md:text-5xl lg:text-6xl mt-2 text-white/90">
                Training Programs
              </span>
            </h1>
            
            {/* Enhanced Description */}
            <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-12">
              Specialized training programs designed for government sector employment with 
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400"> guaranteed placement support</span> and 
              expert guidance from experienced professionals.
            </p>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">95%</div>
                <div className="text-white/80 font-semibold">Success Rate</div>
                <div className="flex items-center justify-center mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">500+</div>
                <div className="text-white/80 font-semibold">Students Placed</div>
                <div className="flex items-center justify-center mt-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 ml-2 text-sm font-semibold">Growing</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">50+</div>
                <div className="text-white/80 font-semibold">Expert Faculty</div>
                <div className="flex items-center justify-center mt-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 ml-2 text-sm font-semibold">Verified</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-3 text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Government Approved</span>
              </div>
              <div className="flex items-center gap-3 text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="font-medium">ISO Certified</span>
              </div>
              <div className="flex items-center gap-3 text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Placement Assured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Government Programs
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              We provide comprehensive training with guaranteed results and expert guidance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">Job Guarantee</h3>
                  <p className="text-white/70 text-center leading-relaxed">100% placement assistance with top government organizations and guaranteed interview opportunities</p>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">Small Batches</h3>
                  <p className="text-white/70 text-center leading-relaxed">Personal attention with maximum 20 students per batch for better learning outcomes</p>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">Flexible Timing</h3>
                  <p className="text-white/70 text-center leading-relaxed">Weekend and weekday batches available for working professionals with flexible schedules</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course List Section */}
      <div className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full text-blue-300 mb-8 border border-blue-400/30">
              <BookOpen className="w-5 h-5" />
              <span className="font-bold">AVAILABLE COURSES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Explore Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Government Programs
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Choose from our comprehensive range of government sector training programs
            </p>
          </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Government Courses Available</h3>
            <p className="text-gray-600">Check back later for new government course offerings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {courses.map((course) => (
                  <div key={course.id} className="group relative">
                    {/* Glass Card */}
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-500">
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Course Image */}
                      <div className="relative h-56 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-center">
                            <Award className="w-16 h-16 text-blue-400 mx-auto mb-3" />
                            <p className="text-sm text-white/70">Course Image</p>
                          </div>
                        )}
                        {course.featured && (
                          <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                            ⭐ Featured
                          </div>
                        )}
                      </div>

                      {/* Course Content */}
                      <div className="relative p-8">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-sm font-bold text-blue-300 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-400/30">
                            {course.level}
                          </span>
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-white font-semibold">{course.rating}</span>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                          {course.title}
                        </h3>
                        
                        <p className="text-white/70 mb-6 line-clamp-3 leading-relaxed">
                          {course.shortDescription || course.description}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-white/60 mb-6">
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-400" />
                            <span>{course.enrollmentCount} Students</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                            {formatBDT(course.price)}
                          </div>
                          <button 
                            onClick={() => handleEnrollClick(course)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Sidebar - Desktop Only */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-6">
                {/* Category Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Why Choose Us?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Comprehensive Study Material</div>
                        <div className="text-sm text-white/70">Updated syllabus with latest exam patterns</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Users className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Expert Faculty</div>
                        <div className="text-sm text-white/70">Experienced government exam trainers</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Target className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white mb-1">Mock Tests</div>
                        <div className="text-sm text-white/70">Regular practice with real exam patterns</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Get in Touch
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">📞</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">+1 (555) 123-4567</div>
                        <div className="text-white/70">Mon-Fri, 9AM-6PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">✉️</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">info@symphonyinstitute.com</div>
                        <div className="text-white/70">24/7 Support</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xs">📍</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">Delhi, Mumbai, Bangalore</div>
                        <div className="text-white/70">Offline Centers</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Enroll Button */}
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 group mb-4">
                  Quick Enroll
                  <Target className="inline-block ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </button>

                {/* Download Brochure */}
                <button className="w-full bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  Download Brochure
                  <BookOpen className="inline-block ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </button>

                {/* Registration Form */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Quick Registration
                  </h3>
                  <p className="text-sm text-white/70 mb-4">
                    Fill out the form below to register instantly
                  </p>
                  <GovtRegistrationForm 
                    courseName="Government Job Preparation"
                    onSuccess={(data) => console.log("Government registration successful:", data)}
                  />
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Government Approved</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>ISO Certified</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Placement Assured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative p-8 border-b border-white/10">
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full text-blue-300 mb-6 border border-blue-400/30">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold">COURSE ENROLLMENT</span>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-4">
                  {selectedCourse.title}
                </h2>
                
                <div className="flex items-center justify-center gap-6 text-white/70">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>{selectedCourse.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span>{selectedCourse.rating} Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                    {formatBDT(selectedCourse.price)}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <EnrollmentForm 
                course={{
                  id: selectedCourse.id,
                  title: selectedCourse.title,
                  price: selectedCourse.price,
                  category: selectedCourse.category,
                  slug: 'government' // Government courses slug
                }}
                onClose={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentCategoryPage;
