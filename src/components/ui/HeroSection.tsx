"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Play, CheckCircle, BookOpen, Users, Award, Clock } from "lucide-react";
import Counter from "@/components/Counter";

const bgImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920",
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState<number | null>(null);

  const advance = useCallback(() => {
    const nxt = (current + 1) % bgImages.length;
    setNext(nxt);
    setTimeout(() => {
      setCurrent(nxt);
      setNext(null);
    }, 1000);
  }, [current]);

  useEffect(() => {
    const interval = setInterval(advance, 5000);
    return () => clearInterval(interval);
  }, [advance]);
  return (
    <section className="relative py-8 md:py-20 overflow-hidden min-h-[550px] md:min-h-[700px] flex items-center">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        {bgImages.map((img, i) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              opacity: next !== null ? (i === next ? 1 : i === current ? 0 : 0) : i === current ? 1 : 0,
            }}
          />
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27]/90 via-[#0d1b3e]/85 to-[#0a0e27]/95" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse">
              Career Today
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-base md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-16 max-w-4xl mx-auto leading-relaxed px-4">
            Master industry-relevant skills with expert mentors and join thousands of successful graduates building their dream careers.
          </p>

          {/* Stats Cards (Fixed Height & Padding according to image) */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 md:mb-16 max-w-5xl mx-auto px-4">
            <div className="glass-card px-6 md:px-10 py-4 md:py-5 group min-w-[140px] md:min-w-[240px] flex flex-col justify-center items-center">
              <div className="text-3xl md:text-5xl font-bold text-green-500 mb-1 md:mb-2 group-hover:scale-105 transition-transform">
                <Counter end={95} suffix="%" />
              </div>
              <div className="text-gray-400 flex items-center justify-center gap-2 text-xs md:text-sm font-medium">
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                <span>Placement Rate</span>
              </div>
            </div>

            <div className="glass-card px-6 md:px-10 py-4 md:py-5 group min-w-[140px] md:min-w-[240px] flex flex-col justify-center items-center">
              <div className="text-3xl md:text-5xl font-bold text-orange-500 mb-1 md:mb-2 group-hover:scale-105 transition-transform">
                <Counter end={5000} suffix="+" />
              </div>
              <div className="text-gray-400 flex items-center justify-center gap-2 text-xs md:text-sm font-medium">
                <Users className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                <span>Students</span>
              </div>
            </div>

            <div className="glass-card px-6 md:px-10 py-4 md:py-5 group min-w-[140px] md:min-w-[240px] flex flex-col justify-center items-center">
              <div className="text-3xl md:text-5xl font-bold text-blue-500 mb-1 md:mb-2 group-hover:scale-105 transition-transform">
                <Counter end={50} suffix="+" />
              </div>
              <div className="text-gray-400 flex items-center justify-center gap-2 text-xs md:text-sm font-medium">
                <Award className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                <span>Expert Mentors</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-8 md:mb-16 px-4">
            <button 
              className="glass-button px-6 md:px-10 py-3 md:py-5 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm md:text-lg font-bold rounded-xl md:rounded-2xl hover:scale-105 transition-all duration-300 group"
              onClick={() => window.location.href = '/courses'}
            >
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <Play className="w-4 h-4 md:w-6 md:h-6 group-hover:scale-110 transition-transform fill-white" />
                <span>Start Learning Now</span>
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
            <button 
              className="glass-button px-6 md:px-10 py-3 md:py-5 border-2 border-gray-700 text-gray-300 text-sm md:text-lg font-bold rounded-xl md:rounded-2xl hover:border-gray-500 transition-all duration-300 group"
              onClick={() => window.location.href = '/courses'}
            >
              <div className="flex items-center justify-center gap-2 md:gap-3">
                <BookOpen className="w-4 h-4 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                <span>Browse All Courses</span>
              </div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8 max-w-5xl mx-auto rounded-[20px] border border-[rgba(99,102,241,0.3)] backdrop-blur-[16px]" style={{background: 'rgba(26, 31, 76, 0.9)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'}}>
            <div className="flex items-center justify-center gap-3 md:gap-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-sm md:text-base">Certified Programs</div>
                <div className="text-xs md:text-sm text-gray-300">Industry recognized</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 md:gap-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 md:w-6 md:h-6 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-sm md:text-base">Expert Mentors</div>
                <div className="text-xs md:text-sm text-gray-300">10+ years experience</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 md:gap-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-sm md:text-base">Lifetime Support</div>
                <div className="text-xs md:text-sm text-gray-300">24/7 assistance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;