"use client";

import { Clock, Users, MapPin, Calendar, Play, Star, Zap, Award, ChevronRight } from "lucide-react";
import { useRouter } from 'next/navigation';

const SimpleCategorySection = () => {
  const router = useRouter();

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
    router.push(`/category/${slug}`);
  };

  return (
    <section className="relative py-24 bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full text-purple-300 text-sm font-semibold mb-8">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>PREMIUM LEARNING EXPERIENCES</span>
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Choose Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Learning Path
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            Discover the perfect learning format that fits your schedule and learning style. 
            From self-paced videos to interactive live sessions, we have options for everyone.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center items-center gap-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">6,300+</div>
              <div className="text-gray-400 text-sm">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">75+</div>
              <div className="text-gray-400 text-sm">Expert Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">4.8/5</div>
              <div className="text-gray-400 text-sm">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">95%</div>
              <div className="text-gray-400 text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="relative h-full">
                {/* Glass Card */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl"></div>
                
                {/* Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500`}></div>
                
                <div className="relative p-8 h-full flex flex-col">
                  {/* Icon Container */}
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${category.color} p-1 shadow-2xl group-hover:rotate-6 transition-transform duration-500`}>
                    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                      <div className="text-white">
                        {category.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                    {category.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-6 text-center flex-grow leading-relaxed">
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
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white font-medium">{category.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Level</span>
                      <span className="text-white font-medium">{category.level}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Students</span>
                      <span className="text-white font-medium">{category.students}</span>
                    </div>
                  </div>
                  
                  {/* Stats Badge */}
                  <div className={`inline-flex items-center justify-between px-4 py-3 bg-gradient-to-r ${category.color} rounded-xl text-white font-bold shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span className="text-sm">{category.stats}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 cursor-pointer">
            <Play className="w-5 h-5" />
            <span>Explore All Courses</span>
            <ChevronRight className="w-5 h-5" />
          </div>
          <p className="text-gray-400 mt-4">Join 6,300+ students already learning</p>
        </div>
      </div>
    </section>
  );
};

export default SimpleCategorySection;
