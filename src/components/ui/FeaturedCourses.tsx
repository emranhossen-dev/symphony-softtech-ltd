"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Clock, Users, Loader2 } from "lucide-react";
import CourseCard from "./CourseCard";

interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  duration: string;
  price: number;
  originalPrice?: string;
  badge?: string;
  badgeColor?: "primary" | "secondary" | "danger";
  instructor?: string;
  students?: number;
  level?: string;
  rating?: number;
  reviewCount?: number;
  thumbnail?: string;
  category?: string;
  categorySlug?: string;
  enrollmentCount?: number;
  moduleCount?: number;
}

const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Update items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = [
    { value: "ALL", label: "All", color: "from-purple-500 to-pink-500" },
    { value: "RECORDED", label: "Recorded", color: "from-blue-500 to-cyan-500" },
    { value: "GOVERNMENT", label: "Govt", color: "from-orange-500 to-red-500" },
    { value: "ONLINE", label: "Online", color: "from-green-500 to-emerald-500" },
    { value: "OFFLINE", label: "Offline", color: "from-yellow-500 to-orange-500" }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, selectedCategory]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching ALL courses...');
      
      // Try the main courses API first - fetch all courses, not just featured
      let response = await fetch('/api/courses?limit=20');
      let data = await response.json();
      
      console.log('📊 Main API response:', data);
      
      if (!data.success || !data.courses) {
        console.log('❌ Main API failed, trying fallback...');
        // Fallback to public courses API - all courses
        response = await fetch('/api/public/courses?limit=20');
        data = await response.json();
        console.log('📊 Fallback API response:', data);
      }
      
      if (data.success && data.courses && Array.isArray(data.courses)) {
        console.log('✅ Successfully fetched', data.courses.length, 'courses');
        console.log('📋 Courses:', data.courses.map((c: any) => ({ id: c.id, title: c.title, category: c.category })));
        setCourses(data.courses);
      } else {
        console.error('Failed to fetch courses - invalid response:', data);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    console.log('🔍 Filtering courses:', { selectedCategory, totalCourses: courses.length });
    
    if (selectedCategory === "ALL") {
      console.log('📋 Showing ALL courses:', courses.length);
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => course.category === selectedCategory);
      console.log('📋 Filtered courses for', selectedCategory, ':', filtered.length);
      setFilteredCourses(filtered);
    }
    setCurrentIndex(0); // Reset carousel when category changes
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => 
      Math.min(filteredCourses.length - itemsPerPage, prev + itemsPerPage)
    );
  };

  const visibleCourses = filteredCourses.slice(currentIndex, currentIndex + itemsPerPage);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < filteredCourses.length;

  if (loading) {
    return (
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Featured
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Courses
              </span>
            </h2>
          </div>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-8 leading-tight">
            Featured
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Courses
            </span>
          </h2>
          <p className="text-base md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
            Discover our handpicked selection of premium courses designed to accelerate your learning journey.
          </p>
        </div>

        {/* Category Togglers */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 px-4">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-4 md:px-8 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.value
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : "glass-button text-gray-300 border border-gray-600 hover:border-gray-400"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Course Count */}
        <div className="text-center mb-6 md:mb-8">
          <span className="text-gray-400 text-xs md:text-sm">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
          </span>
        </div>

        {/* Courses Carousel */}
        {filteredCourses.length > 0 ? (
          <div className="relative w-full overflow-hidden">
            {/* Course Grid - 3 column layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full">
              {filteredCourses.slice(currentIndex, currentIndex + itemsPerPage).map((course, index) => (
                <div key={course.id} className="w-full">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    shortDescription={course.shortDescription}
                    duration={course.duration}
                    price={course.price}
                    originalPrice={course.originalPrice}
                    badge={course.badge}
                    badgeColor={course.badgeColor}
                    instructor={course.instructor}
                    students={course.enrollmentCount || course.students}
                    level={course.level}
                    rating={course.rating}
                    reviewCount={course.reviewCount}
                    thumbnail={course.thumbnail}
                    category={course.category}
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            {filteredCourses.length > itemsPerPage && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                    canGoPrev
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-110 shadow-lg"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                    canGoNext
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-110 shadow-lg"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Carousel Indicators */}
            {filteredCourses.length > itemsPerPage && (
              <div className="flex justify-center gap-2 mt-6 md:mt-8">
                {Array.from({ length: Math.ceil(filteredCourses.length / itemsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index * itemsPerPage)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentIndex === index * itemsPerPage
                        ? "bg-blue-500 w-8"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 text-lg mb-4">
              No courses found in this category.
            </div>
            <button
              onClick={() => handleCategoryChange("ALL")}
              className="glass-button px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
            >
              View All Courses
            </button>
          </div>
        )}

        {/* View All Courses Button */}
        <div className="text-center mt-12 md:mt-16 px-4">
          <button
            onClick={() => window.location.href = '/courses'}
            className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 text-sm md:text-base"
          >
            <span>Explore All Courses</span>
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
