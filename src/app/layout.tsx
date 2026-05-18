import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import RouteLoading from '@/components/RouteLoading';
import NeonBlobs from '@/components/NeonBlobs';

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
      <ThemeProvider>
        <NotificationProvider>
          <html lang="en" suppressHydrationWarning>
            <body
              className={`${poppins.variable} ${inter.variable} antialiased`}
            >
              <NeonBlobs />
              <div className="relative z-10">
                <Suspense fallback={<div>Loading...</div>}>
                  {children}
                </Suspense>
              </div>

              {/* Global Route Loading */}
              <RouteLoading />

              {/* Show Toaster on all routes */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#00d4ff',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ec4899',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </body>
          </html>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

