"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Dynamically import the actual layout to prevent SSR hydration issues
const StudentLayoutContent = dynamic(() => import("@/components/student/StudentLayoutContent"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
});

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  return <StudentLayoutContent>{children}</StudentLayoutContent>;
};

export default StudentLayout;
