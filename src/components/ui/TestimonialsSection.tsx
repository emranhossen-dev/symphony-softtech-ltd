"use client";

import { Star, Quote, ThumbsUp, Heart, Linkedin, Twitter, MapPin, Briefcase, TrendingUp, Award, Users, Sparkles, Play, ChevronLeft, ChevronRight, MessageCircle, Eye } from "lucide-react";
import { getSiteConfig } from '@/lib/config';
import { useState, useEffect } from 'react';

const TestimonialsSection = () => {
  const siteConfig = getSiteConfig();

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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

  const handleLike = (index: number) => {
    setLikedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleLove = (index: number) => {
    setLovedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 transition-all duration-300 ${
              i < rating
                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-white/5"></div>
          
          {/* Animated Gradient Mesh */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/30 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => {
              // Use deterministic values based on index to avoid hydration mismatch
              const seed = i * 137.5; // Prime number for better distribution
              const left = ((seed * 9.7) % 100);
              const top = ((seed * 13.3) % 100);
              const delay = ((seed * 2.1) % 5);
              const duration = 4 + ((seed * 1.7) % 6);
              
              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-40"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`
                  }}
                />
              );
            })}
          </div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-8 border border-white/20">
              <MessageCircle className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-semibold text-white">Student Voices</span>
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Success Stories
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
              Real experiences from real students who transformed their careers with our programs
            </p>
            
            {/* View Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-6 py-2 rounded-full transition-all ${
                  viewMode === 'carousel'
                    ? 'bg-white text-purple-900 font-semibold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Carousel View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-6 py-2 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-purple-900 font-semibold'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Grid View
              </button>
            </div>
          </div>

          {viewMode === 'carousel' ? (
            /* Carousel View */
            <div className="relative max-w-4xl mx-auto">
              <div className="relative h-[600px] flex items-center justify-center">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ${
                      index === currentTestimonialIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95'
                    }`}
                  >
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 h-full flex flex-col justify-between">
                      {/* Quote */}
                      <div className="text-center mb-8">
                        <Quote className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                        <p className="text-2xl text-white font-light leading-relaxed italic">
                          "{testimonial.content}"
                        </p>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex justify-center gap-2 mb-8">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-8 w-8 transition-all duration-300 ${
                              i < testimonial.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Author */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white/20">
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2">{testimonial.name}</h3>
                            <p className="text-purple-300 mb-1">{testimonial.role}</p>
                            <p className="text-gray-400 text-sm">{testimonial.company} • {testimonial.location}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-purple-300 font-medium mb-1">{testimonial.course}</div>
                          <div className="text-xs text-green-400">{testimonial.achievement}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation */}
              <button
                onClick={prevTestimonial}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonialIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonialIndex
                        ? 'bg-white w-8'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Quote className="h-6 w-6 text-white transform rotate-180" />
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-white text-sm mb-4 line-clamp-3">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-semibold text-sm truncate">{testimonial.name}</h4>
                      <p className="text-purple-300 text-xs truncate">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-purple-400">{testimonial.course}</div>
                </div>
              ))}
            </div>
          )}
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "5000+", label: "Graduates", icon: Users },
              { number: "4.9/5", label: "Rating", icon: Star },
              { number: "95%", label: "Success Rate", icon: TrendingUp },
              { number: "50+", label: "Partners", icon: Award }
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <stat.icon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                <div className="text-purple-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default TestimonialsSection;
