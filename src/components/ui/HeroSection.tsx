"use client";

import { ArrowRight, Play, CheckCircle, TrendingUp, BookOpen, Star, Users, Award, Clock } from "lucide-react";
import Counter from "@/components/Counter";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse">
              Career Today
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            Master industry-relevant skills with expert mentors and join thousands of successful graduates building their dream careers.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="glass-card p-8 group">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-500 mb-2 group-hover:scale-110 transition-transform"><Counter end={95} suffix="%" /></div>
                <div className="text-gray-300 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span>Placement Rate</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-8 group">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-500 mb-2 group-hover:scale-110 transition-transform"><Counter end={5000} suffix="+" /></div>
                <div className="text-gray-300 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span>Students</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-8 group">
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-500 mb-2 group-hover:scale-110 transition-transform"><Counter end={50} suffix="+" /></div>
                <div className="text-gray-300 flex items-center justify-center gap-2">
                  <Award className="w-5 h-5 text-indigo-500" />
                  <span>Expert Mentors</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              className="glass-button px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-2xl hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/courses'}
            >
              <div className="flex items-center justify-center gap-3">
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Start Learning Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
            <button 
              className="glass-button px-10 py-5 border-2 border-blue-500/50 text-blue-400 text-lg font-bold rounded-2xl hover:border-blue-400 transition-all duration-300"
              onClick={() => window.location.href = '/courses'}
            >
              <div className="flex items-center justify-center gap-3">
                <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Browse All Courses</span>
              </div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="glass-card flex flex-wrap justify-center items-center gap-10 p-8">
            <div className="flex items-center gap-3 group">
              <div className="glass-button w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-white">Certified Programs</div>
                <div className="text-sm text-gray-400">Industry recognized</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="glass-button w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-white">Expert Mentors</div>
                <div className="text-sm text-gray-400">10+ years experience</div>
              </div>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="glass-button w-12 h-12 bg-indigo-900/50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="font-bold text-white">Lifetime Support</div>
                <div className="text-sm text-gray-400">24/7 assistance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
