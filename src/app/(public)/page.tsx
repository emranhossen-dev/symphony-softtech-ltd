"use client";

import HeroSection from "@/components/ui/HeroSection";
import SimpleCategorySection from "@/components/ui/SimpleCategorySection";
import CategorySection from "@/components/ui/CategorySection";
import WhyChooseUsSection from "@/components/ui/WhyChooseUsSection";
import FeaturedCoursesSection from "@/components/ui/FeaturedCoursesSection";
import TestimonialsSection from "@/components/ui/TestimonialsSection";
import FAQSection from "@/components/ui/FAQSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <SimpleCategorySection />
      <CategorySection />
      <WhyChooseUsSection />
      <FeaturedCoursesSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}
