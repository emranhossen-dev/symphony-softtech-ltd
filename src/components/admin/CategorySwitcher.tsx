import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Clock, Users, MapPin, Calendar, BookOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface CategorySwitcherProps {
  categories: Category[];
  currentSlug: string;
  basePath: string; // e.g., '/admin/category' or '/admin/category/[slug]/enrollment'
  title?: string;
  description?: string;
}

// Map icon names to Lucide icons
const iconMap: { [key: string]: React.ReactNode } = {
  clock: <Clock className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  map: <MapPin className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />,
  default: <BookOpen className="w-6 h-6" />
};

export default function CategorySwitcher({
  categories,
  currentSlug,
  basePath,
  title = "All Categories",
  description = "Navigate between different course categories"
}: CategorySwitcherProps) {
  const router = useRouter();

  const handleCategoryClick = (slug: string) => {
    if (basePath.endsWith('/enrollment')) {
      router.push(`${basePath.replace('[slug]', slug)}`);
    } else {
      router.push(`${basePath}/${slug}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div className="text-base font-medium text-gray-700 dark:text-gray-300">
          {categories.length} categories
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const isActive = currentSlug === cat.slug;
          const categoryColor = cat.color || '#3B82F6';
          const iconComponent = cat.icon ? iconMap[cat.icon] || iconMap.default : iconMap.default;
          
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                isActive
                  ? 'shadow-xl'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              style={{
                borderColor: isActive ? categoryColor : '',
                backgroundColor: isActive ? `${categoryColor}12` : '',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = categoryColor;
                  e.currentTarget.style.backgroundColor = `${categoryColor}08`;
                  e.currentTarget.style.boxShadow = `0 8px 30px ${categoryColor}25`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '';
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div 
                  className={`p-5 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                    isActive 
                      ? 'bg-white dark:bg-gray-700 shadow-xl scale-110' 
                      : 'bg-gray-100 dark:bg-gray-700 group-hover:scale-110 group-hover:shadow-lg'
                  }`}
                  style={{ color: isActive ? categoryColor : '#6B7280' }}
                >
                  {iconComponent}
                </div>
                <div className="text-center w-full">
                  <span className={`font-bold text-lg block ${
                    isActive 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {cat.name}
                  </span>
                  <span className="text-sm mt-2 block font-medium flex items-center justify-center gap-2">
                    {isActive ? (
                      <span className="text-gray-600 dark:text-gray-400">Currently Active</span>
                    ) : (
                      <>
                        <span className="text-gray-500 dark:text-gray-500">Click to View</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </>
                    )}
                  </span>
                </div>
                {isActive && (
                  <div 
                    className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: categoryColor }}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
