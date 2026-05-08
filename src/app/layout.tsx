"use client";

import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { Toaster } from 'react-hot-toast';
import { metadata } from './metadata';
import { AuthProvider } from '@/contexts/AuthContext';
import { RouteLoadingProvider } from '@/contexts/RouteLoadingContext';
import RouteLoading from '@/components/ui/RouteLoading';
import { useRouteChangeLoading } from '@/hooks/useRouteChangeLoading';

// Root layout with conditional Navbar/Footer rendering

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hook to detect route changes and show loading (must be inside RouteLoadingProvider)
  useRouteChangeLoading();
  
  // Check if current route is a public route (not admin, employee, mentor, student)
  const isPublicRoute = !pathname.startsWith('/admin') && 
                        !pathname.startsWith('/employee') && 
                        !pathname.startsWith('/mentor') && 
                        !pathname.startsWith('/student');

  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        {/* Show Navbar and Footer only on public routes */}
        {isPublicRoute && <Navbar />}
        
        {children}
        
        {/* Show Navbar and Footer only on public routes */}
        {isPublicRoute && <Footer />}
        
        {/* Show WhatsApp Widget only on public routes */}
        {isPublicRoute && <WhatsAppWidget />}
        
        {/* Show Toaster on all routes */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* Global Route Loading Indicator */}
        <RouteLoading />
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider key="auth-provider">
      <RouteLoadingProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <LayoutContent>{children}</LayoutContent>
        </Suspense>
      </RouteLoadingProvider>
    </AuthProvider>
  );
}
