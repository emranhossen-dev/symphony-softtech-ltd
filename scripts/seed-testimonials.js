const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTestimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Frontend Developer",
      content: "The training at Symphony Institute transformed my career completely. The practical approach and expert mentors helped me land my dream job. I couldn't be happier with my progress!",
      rating: 5,
      avatar: "SJ",
      company: "Google",
      location: "San Francisco, CA",
      course: "Full Stack Web Development",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2024",
      achievement: "Promoted to Senior Developer",
      order: 1
    },
    {
      name: "Michael Chen",
      role: "Full Stack Developer",
      content: "Best investment I made in my career! The comprehensive curriculum and hands-on projects gave me confidence to tackle real-world challenges. Highly recommend to anyone serious about tech.",
      rating: 5,
      avatar: "MC",
      company: "Microsoft",
      location: "Seattle, WA",
      course: "Data Science & ML",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2024",
      achievement: "Salary increased by 60%",
      order: 2
    },
    {
      name: "Emily Rodriguez",
      role: "React Developer",
      content: "The live support and personalized attention made all the difference. I went from knowing basic HTML to building complex React applications in just a few months.",
      rating: 4,
      avatar: "ER",
      company: "Meta",
      location: "New York, NY",
      course: "Mobile App Development",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2023",
      achievement: "Built 5+ production apps",
      order: 3
    },
    {
      name: "David Kim",
      role: "Software Engineer",
      content: "The certification I earned opened doors to amazing opportunities. The training quality exceeded my expectations and was worth every penny. Thank you Symphony Institute team!",
      rating: 5,
      avatar: "DK",
      company: "Amazon",
      location: "Austin, TX",
      course: "Cloud Computing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      graduationYear: "2024",
      achievement: "AWS Certified Solutions Architect",
      order: 4
    }
  ];

  console.log('🌱 Seeding testimonials...');

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial
    });
    console.log(`✅ Created testimonial for ${testimonial.name}`);
  }

  console.log('🎉 Testimonials seeded successfully!');
}

seedTestimonials()
  .catch((e) => {
    console.error('❌ Error seeding testimonials:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
