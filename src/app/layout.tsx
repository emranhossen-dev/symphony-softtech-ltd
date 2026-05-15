import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import RouteLoading from '@/components/RouteLoading';

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

export const metadata: Metadata = {
  title: "Symphony Institute of Technology",
  description: "Professional Training & Certification",
  icons: {
    icon: "/Logo.jpeg",
    shortcut: "/Logo.jpeg",
    apple: "/Logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider key="auth-provider">
      <html lang="en">
        <body
          className={`${poppins.variable} ${inter.variable} antialiased`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>

          {/* Global Route Loading */}
          <RouteLoading />

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
        </body>
      </html>
    </AuthProvider>
  );
}

