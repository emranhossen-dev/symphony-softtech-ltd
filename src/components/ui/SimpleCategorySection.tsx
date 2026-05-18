"use client";

import { useState } from "react";
import { Clock, Users, MapPin, Calendar, Play, Star, Zap, ChevronRight, ArrowRight, Loader2, BookOpen, X } from "lucide-react";
import { useRouter } from 'next/navigation';
import Counter from "@/components/Counter";
import { formatBDT } from '@/lib/currency';

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  mentor: string;
  moduleCount: number;
  price: number;
  isActive: boolean;
}

const SimpleCategorySection = () => {
  const router = useRouter();
  const [navigatingCategory, setNavigatingCategory] = useState<string | null>(null);

  const categories = [
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Recorded Courses",
      description: "Learn at your own pace with HD video lessons available 24/7",
      stats: "30+ Videos",
      duration: "Lifetime Access",
      level: "Beginner to Advanced",
      rating: 4.8,
      students: "2,500+",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      slug: "recorded"
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Online Batch",
      description: "Interactive live sessions with real-time mentor support",
      stats: "20+ Courses",
      duration: "3-6 Months",
      level: "All Levels",
      rating: 4.9,
      students: "1,800+",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      slug: "online"
    },
    {
      icon: <MapPin className="h-10 w-10" />,
      title: "Offline Batch",
      description: "In-person training with hands-on practical experience",
      stats: "15+ Batches",
      duration: "2-4 Months",
      level: "Intermediate",
      rating: 4.7,
      students: "1,200+",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      slug: "offline"
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "Government Batch",
      description: "Official certified programs with job placement support",
      stats: "10+ Programs",
      duration: "6-12 Months",
      level: "Professional",
      rating: 4.9,
      students: "800+",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      slug: "government"
    }
  ];

  const handleCategoryClick = (slug: string) => {
    setNavigatingCategory(slug);
    router.push(`/courses?category=${slug.toUpperCase()}`);
  };

  const handleAllCoursesClick = () => {
    router.push('/courses');
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full text-purple-300 text-xs md:text-sm font-semibold mb-6 md:mb-8">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            <span>PREMIUM LEARNING EXPERIENCES</span>
            <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-8 leading-tight">
            Choose Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Learning Path
            </span>
          </h2>
          
          <p className="text-base md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 md:mb-12 px-4">
            Discover the perfect learning format that fits your schedule and learning style. 
            From self-paced videos to interactive live sessions, we have options for everyone.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 p-4 md:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-center px-2 md:px-4">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1"><Counter end={6300} suffix="+" /></div>
              <div className="text-gray-400 text-xs md:text-sm">Active Students</div>
            </div>
            <div className="text-center px-2 md:px-4">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1"><Counter end={75} suffix="+" /></div>
              <div className="text-gray-400 text-xs md:text-sm">Expert Mentors</div>
            </div>
            <div className="text-center px-2 md:px-4">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1"><Counter end={4.8} suffix="/5" decimals={1} /></div>
              <div className="text-gray-400 text-xs md:text-sm">Average Rating</div>
            </div>
            <div className="text-center px-2 md:px-4">
              <div className="text-2xl md:text-3xl font-bold text-white mb-1"><Counter end={95} suffix="%" /></div>
              <div className="text-gray-400 text-xs md:text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="relative h-full">
                {/* Glass Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl transition-all duration-300"></div>

                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative p-4 md:p-8 h-full flex flex-col">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-2xl bg-gradient-to-br ${category.color} p-1 shadow-2xl group-hover:rotate-6 transition-transform duration-500`}>
                    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                      <div className="text-white">
                        {category.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {category.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-xs md:text-sm mb-4 md:mb-6 text-center flex-grow leading-relaxed">
                    {category.description}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(category.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                    ))}
                    <span className="text-gray-300 text-sm ml-2">{category.rating}</span>
                  </div>
                  
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 gap-2 md:gap-3 mb-4 md:mb-6">
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white font-medium">{category.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-gray-400">Level</span>
                      <span className="text-white font-medium">{category.level}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs md:text-sm">
                      <span className="text-gray-400">Students</span>
                      <span className="text-white font-medium">{category.students}</span>
                    </div>
                  </div>
                  
                  {/* Stats Badge */}
                  <div className={`inline-flex items-center justify-between px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r ${category.color} rounded-xl text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 mb-3 md:mb-4`}>
                    <span className="text-xs md:text-sm">{category.stats}</span>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Explore Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category.slug);
                    }}
                    disabled={navigatingCategory === category.slug}
                    className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs md:text-sm"
                  >
                    {navigatingCategory === category.slug ? (
                      <>
                        <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>Explore</span>
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-20 px-4">
          <div
            onClick={handleAllCoursesClick}
            className="inline-flex items-center gap-2 md:gap-4 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 cursor-pointer text-sm md:text-base"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5" />
            <span>Explore All Courses</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <p className="text-gray-400 mt-3 md:mt-4 text-sm md:text-base">Join 6,300+ students already learning</p>
        </div>
      </div>
    </section>
  );
};

export default SimpleCategorySection;
