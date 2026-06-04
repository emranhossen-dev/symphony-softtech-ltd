"use client";

import { Clock, Users, Calendar, MapPin, Download, Play, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CourseCardProps {
  id?: string;
  slug?: string;
  title: string;
  description: string;
  shortDescription?: string;
  duration: string;
  price: string | number;
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
  onDownloadBrochure?: () => void;
  onWatchDemo?: () => void;
  showCourseDetails?: boolean;
}

const CourseCard = ({
  id,
  slug,
  title,
  description,
  shortDescription,
  duration,
  price,
  originalPrice,
  badge,
  badgeColor = "primary",
  instructor,
  students,
  level,
  rating = 4.5,
  reviewCount = 0,
  thumbnail,
  category,
  onDownloadBrochure,
  onWatchDemo,
  showCourseDetails = true
}: CourseCardProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    if (slug) {
      router.push(`/course/${slug}`);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const formatPrice = (p: string | number): string => {
    if (typeof p === 'number') {
      return `BDT ${p.toLocaleString()}`;
    }
    return p;
  };

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative glass-card overflow-hidden">
        {/* Course Image */}
        <div className="relative h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-900/30 to-purple-900/30 overflow-hidden">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={title}
              className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-500 mb-2">
                  {title.split(' ').map(word => word[0]?.toUpperCase() || '').join('')}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">Course</div>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex gap-1 sm:gap-2">
            {badge && (
              <div className={`px-2 sm:px-3 py-1 text-white text-xs rounded-full shadow-lg ${
                badgeColor === "primary" ? "bg-gradient-to-r from-blue-500 to-blue-600" :
                badgeColor === "secondary" ? "bg-gradient-to-r from-purple-500 to-purple-600" :
                "bg-gradient-to-r from-indigo-500 to-indigo-600"
              }`}>
                {badge}
              </div>
            )}
            {category && (
              <div className="glass-button px-2 sm:px-3 py-1 text-blue-400 text-xs rounded-full shadow-lg font-medium">
                {category}
              </div>
            )}
          </div>
          
          {/* Rating Badge */}
          <div className="glass-button absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 rounded-full shadow-lg">
            <div className="flex items-center gap-1">
              <Star className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 fill-current" />
              <span className="text-xs sm:text-sm font-semibold text-gray-200">{rating}</span>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-3 sm:p-4 md:p-5">
          {level && (
            <div className="mb-3">
              <span className="text-xs font-medium text-blue-400 bg-blue-900/50 px-2.5 py-1 rounded-full border border-blue-700">
                {level}
              </span>
            </div>
          )}

          <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
            {title}
          </h3>
          
          {/* Rating Row */}
          <div className="flex items-center gap-2 mb-3">
            {renderStars()}
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
          
          <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {shortDescription || description}
          </p>

          {/* Course Details */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-blue-400" />
              <span>{duration}</span>
            </div>
            {students !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
                <span>{students.toLocaleString()} students</span>
              </div>
            )}
          </div>

          {/* Instructor */}
          {instructor && (
            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-blue-900/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {instructor.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-xs text-gray-400">Instructor</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">{instructor}</div>
                </div>
              </div>
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg sm:text-xl font-bold text-blue-400">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">{originalPrice}</span>
              )}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="glass-button px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
