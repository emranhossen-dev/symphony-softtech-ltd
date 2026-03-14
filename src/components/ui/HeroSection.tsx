"use client";

import { ArrowRight, Play, CheckCircle, TrendingUp, BookOpen, Star, Users, Award, Clock } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #10b981 1px, transparent 1px),
                           radial-gradient(circle at 80% 20%, #f59e0b 1px, transparent 1px),
                           radial-gradient(circle at 40% 80%, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200/40 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute top-32 right-10 w-24 h-24 bg-orange-200/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-blue-200/40 rounded-full blur-2xl animate-pulse delay-500"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-orange-500">
              Career Today
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            Master industry-relevant skills with expert mentors and join thousands of successful graduates building their dream careers.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-5xl font-bold text-emerald-600 mb-2 group-hover:scale-110 transition-transform">95%</div>
                <div className="text-gray-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Placement Rate</span>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2 group-hover:scale-110 transition-transform">5000+</div>
                <div className="text-gray-600 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span>Students</span>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">50+</div>
                <div className="text-gray-600 flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>Expert Mentors</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              className="group relative px-10 py-5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/courses'}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <div className="relative flex items-center justify-center gap-3">
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Start Learning Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
            <button 
              className="group px-10 py-5 border-2 border-gray-300 text-gray-700 text-lg font-bold rounded-2xl hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
              onClick={() => window.location.href = '/courses'}
            >
              <div className="flex items-center justify-center gap-3">
                <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Browse All Courses</span>
              </div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-10 p-8 bg-gradient-to-r from-gray-50 to-white rounded-3xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <CheckCircle className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Certified Programs</div>
                <div className="text-sm text-gray-600">Industry recognized</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Award className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Expert Mentors</div>
                <div className="text-sm text-gray-600">10+ years experience</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Clock className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Lifetime Support</div>
                <div className="text-sm text-gray-600">24/7 assistance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
