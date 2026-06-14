"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Employees now use the admin panel directly (/admin/dashboard)
// This page just redirects for backward compatibility
export default function EmployeeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
