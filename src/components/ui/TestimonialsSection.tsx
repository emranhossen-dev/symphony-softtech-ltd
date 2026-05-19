"use client";

import { Star, Quote, TrendingUp, Award, Users, ChevronLeft, ChevronRight, MessageCircle, Eye } from "lucide-react";
import { getSiteConfig } from '@/lib/config';
import { useState, useEffect } from 'react';
import Counter from "@/components/Counter";

const TestimonialsSection = () => {
  const siteConfig = getSiteConfig();

  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [lovedCards, setLovedCards] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      content: `The training at ${siteConfig.name} transformed my career completely. The practical approach and expert mentors helped me land my dream job. I couldn't be happier with my progress!`,
      rating: 5,
      avatar: "SJ",
      company: "Google",
      location: "San Francisco, CA",
      course: "Full Stack Web Development",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2024",
      achievement: "Promoted to Senior Developer"
    },
    {
      name: "Michael Chen",
      role: "Full Stack Developer",
      content: `Best investment I made in my career! The comprehensive curriculum and hands-on projects gave me confidence to tackle real-world challenges. Highly recommend to anyone serious about tech.`,
      rating: 5,
      avatar: "MC",
      company: "Microsoft",
      location: "Seattle, WA",
      course: "Data Science & ML",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2024",
      achievement: "Salary increased by 60%"
    },
    {
      name: "Emily Rodriguez",
      role: "React Developer",
      content: `The live support and personalized attention made all the difference. I went from knowing basic HTML to building complex React applications in just a few months.`,
      rating: 4,
      avatar: "ER",
      company: "Meta",
      location: "New York, NY",
      course: "Mobile App Development",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2023",
      achievement: "Built 5+ production apps"
    },
    {
      name: "David Kim",
      role: "Software Engineer",
      content: `The certification I earned opened doors to amazing opportunities. The training quality exceeded my expectations and was worth every penny. Thank you ${siteConfig.name} team!`,
      rating: 5,
      avatar: "DK",
      company: "Amazon",
      location: "Austin, TX",
      course: "Cloud Computing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2024",
      achievement: "AWS Certified Solutions Architect"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    if (isAutoPlay && viewMode === 'carousel') {
      const interval = setInterval(() => {
        setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, viewMode, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative min-h-screen overflow-hidden w-full">
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 w-full">
        
        {/* Header Section */}
        <div className={`text-center mb-8 md:mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 glass-button px-4 py-2 rounded-full mb-4 md:mb-6 border border-blue-500/30 backdrop-blur-sm">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            <span className="text-xs md:text-sm font-semibold text-white">Student Voices</span>
            <Eye className="h-4 w-4 text-purple-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 relative px-2 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Success Stories
            </span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
          </h1>

          <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto mt-4 mb-6 px-2 leading-relaxed">
            Real experiences from real students who transformed their careers with our programs
          </p>

          {/* View Toggle Controller */}
          <div className="flex justify-center gap-2 md:gap-4 mb-4 px-2">
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-4 md:px-6 py-2 rounded-full transition-all text-xs md:text-sm font-medium ${
                viewMode === 'carousel'
                  ? 'glass-button text-blue-400 font-semibold border-2 border-blue-500/50 bg-blue-500/10'
                  : 'glass-button text-gray-300 hover:border-blue-400'
              }`}
            >
              Carousel View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 md:px-6 py-2 rounded-full transition-all text-xs md:text-sm font-medium ${
                viewMode === 'grid'
                  ? 'glass-button text-blue-400 font-semibold border-2 border-blue-500/50 bg-blue-500/10'
                  : 'glass-button text-gray-300 hover:border-blue-400'
              }`}
            >
              Grid View
            </button>
          </div>
        </div>

        {/* Carousel Layout Mode */}
        {viewMode === 'carousel' ? (
          <div className="relative max-w-4xl lg:max-w-5xl mx-auto px-1 sm:px-4">
            {/* Wrapper wrapper height configuration dynamic based on viewports */}
            <div className="relative h-[520px] sm:h-[480px] md:h-[520px] lg:h-[580px] flex items-center justify-center w-full">
              
              {/* Left Arrow Button */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 glass-button rounded-full flex items-center justify-center text-white hover:border-blue-400 transition-all border border-blue-500/30 z-20 active:scale-95"
              >
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
              </button>

              {/* Slider Testimonial Area */}
              <div className="relative w-full h-full px-2 sm:px-4">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out ${
                      index === currentTestimonialIndex
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <div className="glass-card p-6 sm:p-8 md:p-10 lg:p-14 h-full flex flex-col justify-between border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md shadow-2xl">
                      
                      {/* Top Quote Content */}
                      <div className="text-center overflow-y-auto no-scrollbar flex-1 flex flex-col justify-center">
                        <Quote className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-blue-400 mx-auto mb-3 sm:mb-5 opacity-80" />
                        <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white font-light leading-relaxed italic line-clamp-6 sm:line-clamp-4">
                          "{testimonial.content}"
                        </p>
                      </div>

                      {/* Middle Star Ratings */}
                      <div className="flex justify-center gap-1.5 sm:gap-2 my-4 sm:my-5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ${
                              i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Bottom Author Layout Metadata */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-4 text-center sm:text-left">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden ring-2 ring-blue-500/30 shrink-0">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">{testimonial.name}</h3>
                            <p className="text-blue-300 text-sm sm:text-base truncate font-medium">{testimonial.role}</p>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">{testimonial.company} • {testimonial.location}</p>
                          </div>
                        </div>

                        <div className="text-center sm:text-right shrink-0">
                          <div className="text-sm sm:text-base text-blue-300 font-medium mb-1">{testimonial.course}</div>
                          <div className="text-xs sm:text-sm text-green-400 font-semibold bg-green-500/10 px-3 py-1 rounded-full inline-block">{testimonial.achievement}</div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 glass-button rounded-full flex items-center justify-center text-white hover:border-blue-400 transition-all border border-blue-500/30 z-20 active:scale-95"
              >
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Slider Active Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonialIndex ? 'bg-blue-400 w-6' : 'bg-gray-600 hover:bg-gray-500 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Responsive Responsive Grid Layout Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="glass-card p-5 hover:bg-blue-900/20 transition-all duration-300 hover:scale-[102] md:hover:scale-105 hover:-translate-y-1 group border border-white/5 rounded-xl flex flex-col justify-between bg-white/5"
              >
                <div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <Quote className="h-5 w-5 text-white transform rotate-180" />
                  </div>
                  
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-white text-xs sm:text-sm mb-4 line-clamp-4 leading-relaxed font-light">
                    "{testimonial.content}"
                  </p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center gap-3 pt-3 border-t border-white/5 mb-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-500/20 shrink-0">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-semibold text-xs sm:text-sm truncate">{testimonial.name}</h4>
                      <p className="text-blue-300 text-[11px] truncate">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-400/90 font-medium truncate">{testimonial.course}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Statistics Metric Section */}
        <div className="mt-12 sm:mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto w-full">
          {[
            { number: 5000, label: "Graduates", icon: Users },
            { number: 4.9, label: "Rating", icon: Star, suffix: "/5", decimals: 1 },
            { number: 95, label: "Success Rate", icon: TrendingUp, suffix: "%" },
            { number: 50, label: "Partners", icon: Award, suffix: "+" }
          ].map((stat, index) => (
            <div
              key={index}
              className="glass-card p-4 sm:p-6 text-center hover:scale-105 hover:border-blue-500/50 hover:bg-blue-900/30 transition-all duration-300 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm"
            >
              <stat.icon className="h-5 w-5 sm:h-7 sm:w-7 text-blue-400 mx-auto mb-1 sm:mb-2.5" />
              <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white mb-0.5 sm:mb-1 tracking-tight">
                <Counter end={stat.number} suffix={stat.suffix || ""} decimals={stat.decimals || 0} />
              </div>
              <div className="text-blue-300 text-[11px] sm:text-xs md:text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;