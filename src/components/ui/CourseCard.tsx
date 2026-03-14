import { Clock, Users, Calendar, MapPin } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  duration: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  badgeColor?: "primary" | "secondary" | "danger";
  instructor?: string;
  students?: number;
  level?: string;
}

const CourseCard = ({ 
  title, 
  description, 
  duration, 
  price, 
  originalPrice, 
  badge, 
  badgeColor = "primary",
  instructor,
  students,
  level
}: CourseCardProps) => {
  return (
    <div className="card hover-lift-premium group">
      {/* Course Badge */}
      {badge && (
        <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${
          badgeColor === "primary" 
            ? "bg-primary text-white" 
            : badgeColor === "secondary"
            ? "bg-secondary text-white"
            : "bg-danger text-white"
        }`}>
          {badge}
        </div>
      )}

      {/* Course Image */}
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {title.split(' ').map(word => word[0].toUpperCase()).join('')}
          </div>
          <div className="text-sm text-gray-600">Course</div>
        </div>
      </div>

      <div className="p-6">
        {/* Course Title */}
        <h3 className="heading-tertiary mb-3 group-hover:text-gradient-primary transition-all duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Course Meta */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-primary" />
            <span>{duration}</span>
          </div>
          {students && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span>{students.toLocaleString()} students</span>
            </div>
          )}
          {level && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{level}</span>
            </div>
          )}
        </div>

        {/* Instructor */}
        {instructor && (
          <div className="mb-4">
            <div className="text-sm text-gray-600">Instructor</div>
            <div className="font-semibold text-dark">{instructor}</div>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-2xl font-bold text-gradient-primary">{price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">{originalPrice}</span>
            )}
          </div>
          {originalPrice && (
            <span className="badge-primary text-xs">40% OFF</span>
          )}
        </div>

        {/* Enroll Button */}
        <button className="w-full btn-primary group/btn">
          Enroll Now
          <Calendar className="inline-block ml-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
