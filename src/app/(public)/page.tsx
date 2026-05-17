"use client";

import HeroSection from "@/components/ui/HeroSection";
import CategoryWiseCoursesSection from "@/components/ui/CategoryWiseCoursesSection";
import WhyChooseUsSection from "@/components/ui/WhyChooseUsSection";
import TestimonialsSection from "@/components/ui/TestimonialsSection";
import FAQSection from "@/components/ui/FAQSection";
import ScrollAnimation from "@/components/ScrollAnimation";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ScrollAnimation direction="bottom" delay={0.1}>
        <CategoryWiseCoursesSection />
      </ScrollAnimation>
      <ScrollAnimation direction="bottom" delay={0.2}>
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
