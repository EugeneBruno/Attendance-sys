// components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // Helper function to check if a tab is active
  // We do an exact match for the home page, and an "includes" match for others
  const isActive = (path: string) => {
    if (path === "/dashboard/student") {
      return pathname === path;
    }
    return pathname?.includes(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-zinc-200 flex justify-around items-center h-16 z-50 pb-safe">
      
      {/* 1. HOME TAB */}
      <Link 
        href="/dashboard/student" 
        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
          isActive("/dashboard/student") ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
        }`}
      >
        <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/dashboard/student") ? 2.5 : 2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      {/* 2. SCAN TAB (Floating Action Button Style) */}
      <Link 
        href="/dashboard/student/scan" 
        className="flex flex-col items-center justify-center w-full h-full"
      >
        <div className={`p-3 rounded-full -mt-8 border-4 border-zinc-50 shadow-sm transition-transform active:scale-95 ${
          isActive("/dashboard/student/scan") ? "bg-zinc-800 text-white" : "bg-black text-white"
        }`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className={`text-[10px] font-medium mt-1 ${isActive("/dashboard/student/scan") ? "text-zinc-900" : "text-zinc-500"}`}>
          Scan
        </span>
      </Link>

      {/* 3. HISTORY TAB */}
      <Link 
        href="/dashboard/student/history" 
        className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
          isActive("/dashboard/student/history") ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
        }`}
      >
        <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive("/dashboard/student/history") ? 2.5 : 2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[10px] font-medium">History</span>
      </Link>

    </nav>
  );
}