"use client";

import HeroSection from "@/components/ui/HeroSection";
import CategoryWiseCoursesSection from "@/components/ui/CategoryWiseCoursesSection";
import WhyChooseUsSection from "@/components/ui/WhyChooseUsSection";
import TestimonialsSection from "@/components/ui/TestimonialsSection";
import FAQSection from "@/components/ui/FAQSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoryWiseCoursesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}
