"use client";

import { useState, useEffect } from "react";
import { Menu, X, User, LogIn, ChevronDown, BookOpen, Users, Phone, GraduationCap, Sparkles, Star } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from 'next/link';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileCourseDropdownOpen, setIsMobileCourseDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  // Force nav background to solid dark blue and remove glass effect
  useEffect(() => {
    const navEl = document.querySelector('nav');
    if (navEl) {
      try {
        navEl.style.setProperty('background-color', '#0a0e27', 'important');
        navEl.style.setProperty('background-image', 'none', 'important');
        navEl.style.setProperty('backdrop-filter', 'none', 'important');
        navEl.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        navEl.style.setProperty('opacity', '1', 'important');
      } catch (e) {
        // ignore
      }
    }
  }, [isScrolled, mounted]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector('nav');
      if (nav && !nav.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsMobileCourseDropdownOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMenuOpen(false);
        setIsMobileCourseDropdownOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 overflow-visible ${
      isScrolled 
        ? "bg-[#0a0e27] bg-opacity-100 shadow-2xl" 
        : "bg-[#0a0e27] bg-opacity-100 shadow-xl"
    }`}>
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex justify-between items-center h-18">
          {/* Premium Logo Section */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-2 md:space-x-3 group">
              <div className="relative">
                <img
                  src="/Logo.jpeg"
                  alt="Symphony Institute of Technology"
                  className="h-10 md:h-14 w-auto object-contain rounded-lg shadow-lg bg-white p-0.5 md:p-1"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm md:text-lg font-bold text-white group-hover:text-emerald-200 transition-all duration-300 leading-tight">
                  Symphony Institute
                </div>
                <div className="text-[10px] md:text-xs text-gray-300 font-medium tracking-wide">of Technology</div>
              </div>
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
                      ? "bg-slate-700 text-white shadow-lg border border-slate-600"
                      : "text-gray-300 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-600"
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
                  <div
                    className={`absolute top-full left-0 mt-2 w-56 rounded-xl shadow-2xl z-50 transition-all duration-300 transform bg-[#0a0e27] nav-dropdown border border-slate-700 ${
                      isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'
                    }`}
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}>
                    <div className="p-2 space-y-1 rounded-xl w-full">
                      {courseCategories.map((category) => (
                        <a key={category.href} href={category.href} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700 transition-all duration-300 group">
                          <div className={`w-7 h-7 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                            {category.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-semibold text-gray-100 group-hover:text-white transition-colors text-xs`}>{category.label}</div>
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
            <Link
              href="/login"
              className="group flex items-center space-x-3 px-6 py-3 text-sm font-bold text-white border-2 border-slate-500 rounded-xl hover:border-white hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-3 rounded-xl text-white hover:bg-slate-700 focus:outline-none transition-all duration-300 transform hover:scale-105 z-50"
            >
              <div className="relative w-7 h-7">
                {isMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </div>
              <div className={`absolute inset-0 bg-slate-600 rounded-xl opacity-0 ${isMenuOpen ? 'opacity-100' : ''} transition-opacity duration-300`}></div>
            </button>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden border-t border-purple-600 bg-[#0a0e27] nav-dropdown rounded-b-3xl shadow-2xl absolute top-full left-0 right-0 z-50">
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.href === "/courses") {
                        e.preventDefault();
                        setIsMobileCourseDropdownOpen(!isMobileCourseDropdownOpen);
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-4 rounded-xl text-base font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-x-1 ${
                      isActive(link.href)
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                        : "text-gray-200 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {link.icon && <span className="w-5 h-5 text-purple-400">{link.icon}</span>}
                      <span>{link.label}</span>
                    </div>
                    {link.href === "/courses" && (
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isMobileCourseDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                  </a>
                  
                  {/* Mobile Course Dropdown */}
                  {link.href === "/courses" && isMobileCourseDropdownOpen && (
                    <div className="ml-4 mt-2 space-y-2 pl-4 border-l-2 border-purple-600">
                      {courseCategories.map((category) => (
                        <a
                          key={category.href}
                          href={category.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-all duration-300"
                        >
                          <div className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center shadow-lg`}>
                            {category.icon}
                          </div>
                          <span>{category.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-6 mt-6 border-t border-purple-600">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center space-x-3 w-full px-6 py-4 text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
