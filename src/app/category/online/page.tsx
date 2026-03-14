"use client";

import { useState, useEffect } from 'react';
import { formatBDT } from '@/lib/currency';
import OnlineRegistrationForm from "@/components/ui/OnlineRegistrationForm";
import EnrollmentForm from "@/components/enrollment/EnrollmentForm";
import { Users, Clock, Video, Headphones, Star, TrendingUp, X, BookOpen, Play, CheckCircle, ArrowRight, Sparkles, GraduationCap, Monitor, Award } from "lucide-react";

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

const OnlineCategoryPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  useEffect(() => {
    fetchOnlineCourses();
  }, []);

  const fetchOnlineCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses?category=ONLINE');
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching online courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollmentModal(true);
  };

  const handleCloseEnrollment = () => {
    setShowEnrollmentModal(false);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-xl w-1/3 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background with glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-white to-purple-600/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)] opacity-40"></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-bounce delay-1000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center py-20 lg:py-24">
            {/* Badge with animation */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-blue-700 mb-8 border border-blue-200/50 shadow-lg animate-pulse">
              <Video className="w-5 h-5" />
              <span className="font-semibold">Live Online Learning</span>
              <Sparkles className="w-4 h-4 text-purple-500 animate-spin" />
            </div>

            {/* Main Title with enhanced gradient */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Online
              <span className="block text-4xl md:text-5xl lg:text-6xl mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-300% animate-gradient">
                Interactive Training
              </span>
            </h1>
            
            {/* Subtitle with better typography */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-16">
              Experience the flexibility of 
              <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg"> learning from anywhere</span> with our live interactive sessions. 
              Connect with <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-lg"> expert instructors</span> and peers in real-time collaborative environments.
            </p>

            {/* Enhanced Statistics Row with animations */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105 group">
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">3,000+</div>
                <div className="text-gray-600 font-medium">Students</div>
                <div className="flex items-center justify-center mt-2">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105 group">
                <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">20+</div>
                <div className="text-gray-600 font-medium">Courses</div>
                <div className="flex items-center justify-center mt-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105 group">
                <div className="text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">50</div>
                <div className="text-gray-600 font-medium">Max Batch Size</div>
                <div className="flex items-center justify-center mt-2">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105 group">
                <div className="text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">97%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
                <div className="flex items-center justify-center mt-2">
                  <Award className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons with better animations */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 relative overflow-hidden">
                <span className="relative z-10">Explore Courses</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-blue-700 font-semibold rounded-2xl border border-blue-200 hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section with better animations */}
      <div className="py-20 bg-white/60 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/50 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-200/50 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Online Learning?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Experience the best of digital education with interactive features and flexible learning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-3xl"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Live Interactive Classes</h3>
                <p className="text-gray-600 leading-relaxed relative z-10">Real-time interaction with instructors and peers through high-quality video conferencing</p>
                <div className="mt-4 flex items-center gap-2 text-blue-600 relative z-10">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Real-time Learning</span>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-3xl"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Recorded Sessions</h3>
                <p className="text-gray-600 leading-relaxed relative z-10">Access recorded classes anytime for revision and catch up on missed sessions</p>
                <div className="mt-4 flex items-center gap-2 text-purple-600 relative z-10">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Lifetime Access</span>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-3xl"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Flexible Schedule</h3>
                <p className="text-gray-600 leading-relaxed relative z-10">Learn at your own pace with flexible timing and access from any device</p>
                <div className="mt-4 flex items-center gap-2 text-blue-600 relative z-10">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Learn Anywhere</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Course List Section */}
      <div className="py-20 bg-gradient-to-br from-white to-blue-50/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100/30 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Online Courses</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose from our comprehensive range of online training programs</p>
          </div>
          
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Online Courses Available</h3>
              <p className="text-gray-600 mb-8">Check back later for new online course offerings.</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                Browse Offline Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <div key={course.id} className="group">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100 relative">
                    {/* Course Image with enhanced effects */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-16 h-16 text-blue-600" />
                        </div>
                      )}
                      
                      {/* Enhanced Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {course.featured && (
                          <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </div>
                        )}
                        <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full shadow-lg">
                          Online
                        </div>
                      </div>
                      
                      {/* Enhanced Rating Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-semibold text-gray-700">{course.rating}</span>
                        </div>
                      </div>
                      
                      {/* Enhanced Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Floating number indicator */}
                      <div className="absolute bottom-4 left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </div>
                    </div>

                    {/* Enhanced Course Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                          {course.level}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>

                      {/* Enhanced Course Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <div className="flex items-center gap-1 group">
                          <Clock className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 group">
                          <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                          <span>{course.enrollmentCount} students</span>
                        </div>
                      </div>

                      {/* Enhanced Price and Buttons */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {formatBDT(course.price)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.location.href = `/course/${course.id}`}
                            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => handleEnrollClick(course)}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden"
                          >
                            <span className="relative z-10">Enroll Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                          </button>
                        </div>
                      </div>
                      
                      {/* Additional Course Features */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                          <span>Certificate Included</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-purple-500" />
                          <span>Job Support</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Trust Section */}
      <div className="py-16 bg-white/80 backdrop-blur-sm relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h3>
            <p className="text-gray-600 mb-8">Join thousands of successful professionals who started their journey with us</p>
            
            {/* Trust indicators with animations */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Live Sessions</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Expert Instructors</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Recorded Videos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Certificate</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 hover:bg-white/80 transition-all duration-300 transform hover:scale-105">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Job Support</span>
              </div>
            </div>
            
            {/* Success stories or testimonials */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Success Stories</h4>
                    <p className="text-gray-600">Our students have successfully transitioned to top companies and are now leading in their respective fields.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">92%</div>
                    <div className="text-sm text-gray-600">Job Placement Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
                    <div className="text-sm text-gray-600">Student Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">600+</div>
                    <div className="text-sm text-gray-600">Companies Hire</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer CTA */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join our online training programs and transform your career with expert guidance</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started Today
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300">
              Download Brochure
            </button>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollmentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={handleCloseEnrollment}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <EnrollmentForm
              course={{
                id: selectedCourse.id,
                title: selectedCourse.title,
                price: selectedCourse.price,
                category: selectedCourse.category,
                slug: 'online'
              }}
              onClose={handleCloseEnrollment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineCategoryPage;
