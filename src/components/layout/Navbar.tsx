"use client";

import { useState, useEffect } from "react";
import { Menu, X, User, LogIn, ChevronDown, BookOpen, Users, Phone, GraduationCap, Sparkles, Star } from "lucide-react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    return pathname === path;
  };

  const navLinks = [
    { href: "/", label: "Home", icon: null },
    { href: "/courses", label: "Courses", icon: <BookOpen className="w-4 h-4" /> },
    { href: "/about", label: "About", icon: <Users className="w-4 h-4" /> },
    { href: "/contact", label: "Contact", icon: <Phone className="w-4 h-4" /> },
  ];

  const courseCategories = [
    { href: "/category/online", label: "Online Courses", icon: <BookOpen className="w-6 h-6" />, color: "from-emerald-500 to-teal-500", hoverColor: "from-emerald-50 to-teal-50", textColor: "text-emerald-600" },
    { href: "/category/offline", label: "Offline Classes", icon: <GraduationCap className="w-6 h-6" />, color: "from-orange-500 to-yellow-500", hoverColor: "from-orange-50 to-yellow-50", textColor: "text-orange-600" },
    { href: "/category/recorded", label: "Recorded Sessions", icon: <Users className="w-6 h-6" />, color: "from-purple-500 to-pink-500", hoverColor: "from-purple-50 to-pink-50", textColor: "text-purple-600" },
    { href: "/category/government", label: "Government Courses", icon: <Users className="w-6 h-6" />, color: "from-blue-500 to-indigo-500", hoverColor: "from-blue-50 to-indigo-50", textColor: "text-blue-600" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-gradient-to-r from-purple-800/95 to-blue-900/95 backdrop-blur-xl shadow-2xl border-b border-purple-700/30" 
        : "bg-gradient-to-r from-purple-700/90 to-blue-800/90 backdrop-blur-lg shadow-xl border-b border-purple-600/20"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-18">
          {/* Premium Logo Section */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img 
                  src="/Logo.jpeg" 
                  alt="Symphony Institute of Technology" 
                  className="relative h-14 w-auto object-contain rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute -top-2 -right-2">
                  <div className="relative">
                    <Star className="w-5 h-5 text-yellow-300 animate-pulse drop-shadow-lg" />
                    <div className="absolute inset-0 bg-yellow-300 rounded-full blur-md animate-ping"></div>
                  </div>
                </div>
              </div>
              {/* <div className="hidden lg:block">
                <div className="text-xl font-bold text-white group-hover:text-yellow-200 transition-all duration-300 drop-shadow-lg">
                  Symphony Training
                </div>
                <div className="text-sm text-yellow-100 font-medium">Excellence in Education</div>
              </div> */}
            </a>
          </div>

          {/* Premium Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-2">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group">
                <a
                  href={link.href}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                    isActive(link.href)
                      ? "bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30"
                      : "text-white/90 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm border border-transparent hover:border-white/20"
                  }`}
                  onMouseEnter={() => link.href === "/courses" && setIsDropdownOpen(true)}
                  onMouseLeave={() => link.href === "/courses" && setIsDropdownOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.href === "/courses" && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  )}
                </a>
                
                {/* Premium Dropdown for Courses */}
                {link.href === "/courses" && (
                  <div className={`absolute top-full left-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-200 transition-all duration-300 transform ${
                    isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'
                  }`}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}>
                    <div className="p-4 space-y-2">
                      {courseCategories.map((category) => (
                        <a key={category.href} href={category.href} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:${category.hoverColor} transition-all duration-300 group">
                          <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            {category.icon}
                          </div>
                          <div>
                            <div className={`font-bold text-gray-900 group-hover:${category.textColor} transition-colors`}>{category.label}</div>
                            <div className="text-sm text-gray-600">Professional training</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Premium Action Buttons */}
          <div className="hidden xl:flex items-center space-x-4">
            <a 
              href="/login" 
              className="group flex items-center space-x-3 px-6 py-3 text-sm font-bold text-white border-2 border-white/50 rounded-xl hover:border-white hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Login</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-3 rounded-xl text-white hover:bg-white/10 hover:backdrop-blur-sm focus:outline-none transition-all duration-300 transform hover:scale-105 z-50"
            >
              <div className="relative w-7 h-7">
                {isMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </div>
              <div className={`absolute inset-0 bg-white/20 rounded-xl opacity-0 ${isMenuOpen ? 'opacity-100' : ''} transition-opacity duration-300`}></div>
            </button>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden border-t border-gray-800 bg-[#1a1a2e] rounded-b-3xl shadow-2xl absolute top-full left-0 right-0 z-40">
            <div className="px-6 py-6 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-4 px-5 py-4 rounded-2xl text-base font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-x-2 ${
                    isActive(link.href)
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-purple-600/20 hover:text-white"
                  }`}
                >
                  {link.icon && <span className="w-5 h-5 text-gray-400">{link.icon}</span>}
                  <span>{link.label}</span>
                </a>
              ))}

              <div className="pt-6 mt-6 border-t border-gray-700">
                <a
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center space-x-3 w-full px-6 py-4 text-base font-bold bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
