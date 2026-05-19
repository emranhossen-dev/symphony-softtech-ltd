import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveChatWidget from "@/components/LiveChatWidget";

export const metadata: Metadata = {
  title: "Symphony Institute of Technology - Professional Training & Certification",
  description: "Empowering professionals with industry-leading training and certification programs. Build your career with our comprehensive courses.",
  keywords: ["training", "certification", "professional development", "courses", "Symphony"],
  openGraph: {
    title: "Symphony Institute of Technology - Professional Training & Certification",
    description: "Empowering professionals with industry-leading training and certification programs.",
    type: "website",
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-18">{children}</main>
      <Footer />
      <LiveChatWidget />
    </>
  );
}

