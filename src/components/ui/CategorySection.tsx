"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Calendar, MapPin, TrendingUp, Award, CheckCircle, Loader2, Star, Zap, ArrowRight, Play, BookOpen, Target, Sparkles, ChevronRight, Monitor, Video, Globe, Building, Heart, Flame, Rocket, Brain, Lightbulb, Code, Palette, Music, Camera, PenTool } from "lucide-react";
import { FeaturesConfig, getFeaturesConfig } from '@/lib/config';
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  courses: Course[];
}

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const router = useRouter();
  const featuresConfig = getFeaturesConfig();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public/categories');
      const data = await response.json();
      
      if (data.success) {
        // Filter only active categories with active courses based on features
        const activeCategories = data.categories
          .filter((cat: Category) => {
            // Check if category is active and feature is enabled
            if (!cat.isActive) return false;
            
            // Map category slugs to feature keys
            const featureMap: { [key: string]: keyof FeaturesConfig } = {
              'live-classes': 'enableLiveClasses',
              'recorded-courses': 'enableRecordedCourses', 
              'online-courses': 'enableOnlineCourses',
              'offline-courses': 'enableOfflineCourses',
              'government-courses': 'enableGovernmentCourses'
            };
            
            const featureKey = featureMap[cat.slug.toLowerCase()];
            const isEnabled = featureKey ? featuresConfig[featureKey] : true;
            
            return isEnabled;
          })
          .map((cat: Category) => ({
            ...cat,
            courses: cat.courses.filter((course: Course) => course.isActive)
          }))
          .filter((cat: Category) => cat.courses.length > 0);
        
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: JSX.Element } = {
      clock: <Clock className="w-6 h-6" />,
      users: <Users className="w-6 h-6" />,
      calendar: <Calendar className="w-6 h-6" />,
      map: <MapPin className="w-6 h-6" />,
      monitor: <Monitor className="w-6 h-6" />,
      video: <Video className="w-6 h-6" />,
      globe: <Globe className="w-6 h-6" />,
      building: <Building className="w-6 h-6" />,
      'live-classes': <Rocket className="w-6 h-6" />,
      'recorded-courses': <Video className="w-6 h-6" />,
      'online-courses': <Globe className="w-6 h-6" />,
      'offline-courses': <Building className="w-6 h-6" />,
      'government-courses': <Building className="w-6 h-6" />
    };
    return icons[iconName] || <BookOpen className="w-6 h-6" />;
  };

  const getCategoryColor = (color: string) => {
    return color === 'primary' ? 'primary' : 'secondary';
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}`);
  };

  const handleCourseClick = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <section className="relative min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;)] opacity-20"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 animate-pulse">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loading Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Learning Journey
            </span>
          </h2>
          <div className="flex justify-center items-center space-x-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-white/60">Preparing amazing courses...</span>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Hide section if no active categories
  }

  return (
    <section className="relative min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-6 py-3 rounded-full text-purple-300 mb-8 border border-purple-400/30">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-semibold">DISCOVER YOUR PATH</span>
            <Heart className="w-5 h-5 text-red-400" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Choose Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              Learning Path
            </span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12">
            Transform your career with our expertly designed learning pathways. 
            Choose from flexible formats that fit your lifestyle and goals.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {categories.reduce((acc, cat) => acc + cat.courses.length, 0)}+
              </div>
              <div className="text-white/60 text-sm">Courses</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-pink-400 mb-2">
                {categories.length}
              </div>
              <div className="text-white/60 text-sm">Pathways</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                24/7
              </div>
              <div className="text-white/60 text-sm">Access</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(index)}
              className={`group relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === index
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/25'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transform transition-transform duration-300 ${
                  activeTab === index ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {getCategoryIcon(category.icon)}
                </div>
                <span>{category.name}</span>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === index 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {category.courses.length}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Category Content */}
        {categories[activeTab] && (
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    {getCategoryIcon(categories[activeTab].icon)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {categories[activeTab].name}
                    </h2>
                    <div className="flex items-center gap-2 text-white/60">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>{categories[activeTab].courses.length} Courses Available</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                  {categories[activeTab].description}
                </p>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 border border-purple-400/30">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Flexible Timing</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 rounded-full text-pink-300 border border-pink-400/30">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 border border-blue-400/30">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Expert Mentor</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleCategoryClick(categories[activeTab].slug)}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  <span>Explore All Courses</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-30"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                    <Lightbulb className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2 text-center">
                      Start Learning Today
                    </h3>
                    <p className="text-white/60 text-center">
                      Join thousands of learners already on their journey to success
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Grid */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Featured Courses
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories[activeTab].courses.map((course, index) => (
                  <div 
                    key={course.id}
                    className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
                    onClick={() => handleCourseClick(course.id)}
                    onMouseEnter={() => setHoveredCourse(course.id)}
                    onMouseLeave={() => setHoveredCourse(null)}
                  >
                    {hoveredCourse === course.id && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl"></div>
                    )}
                    
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                          {course.moduleCount} Modules
                        </span>
                        <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                          {formatBDT(course.price)}
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors line-clamp-2">
                        {course.title}
                      </h4>
                      
                      <div className="flex items-center justify-between text-white/60 text-sm">
                        <span>{course.mentor}</span>
                        <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {categories[activeTab].courses.length > 6 && (
                <div className="text-center mt-8">
                  <button 
                    onClick={() => handleCategoryClick(categories[activeTab].slug)}
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    View all {categories[activeTab].courses.length} courses
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default CategorySection;
