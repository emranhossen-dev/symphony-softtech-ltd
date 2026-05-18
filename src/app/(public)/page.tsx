"use client";

import HeroSection from "@/components/ui/HeroSection";
import SimpleCategorySection from "@/components/ui/SimpleCategorySection";
import FeaturedCourses from "@/components/ui/FeaturedCourses";
import WhyChooseUsSection from "@/components/ui/WhyChooseUsSection";
import TestimonialsSection from "@/components/ui/TestimonialsSection";
import FAQSection from "@/components/ui/FAQSection";
import ScrollAnimation from "@/components/ScrollAnimation";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ScrollAnimation direction="bottom" delay={0.1}>
        <SimpleCategorySection />
      </ScrollAnimation>
      <ScrollAnimation direction="bottom" delay={0.2}>
        <FeaturedCourses />
      </ScrollAnimation>
      <ScrollAnimation direction="bottom" delay={0.3}>
        <WhyChooseUsSection />
      </ScrollAnimation>
      <ScrollAnimation direction="bottom" delay={0.3}>
        <TestimonialsSection />
      </ScrollAnimation>
      <ScrollAnimation direction="bottom" delay={0.4}>
        <FAQSection />
      </ScrollAnimation>
    </>
  );
}
