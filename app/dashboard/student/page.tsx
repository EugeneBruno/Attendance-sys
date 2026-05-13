// app/dashboard/student/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function StudentDashboard() {
  // 1. Authenticate & Protect Route
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'STUDENT') redirect('/dashboard/admin');

  // 2. Fetch Student Data & Enrolled Courses
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      studentCourses: {
        include: {
          course: true,
        }
      }
    }
  });

  if (!student) redirect('/login');

  // If they somehow bypassed onboarding and haven't verified their face, send them back
  if (!student.faceVerified) redirect('/onboarding');

  // 3. Mocking Attendance Data (Until we build the actual Attendance Log table)
  // We simulate that the semester has had 20 classes so far.
  const TOTAL_CLASSES = 20;
  
  const coursesWithStats = student.studentCourses.map(sc => {
    //here all these are mock data. the team responsible will create the fetch from the database. Remember to add the atendance Table to the db and create a get route at api/attendance
    const attended = Math.floor(Math.random() * 11) + 10; 
    const percentage = Math.round((attended / TOTAL_CLASSES) * 100);
    const isAtRisk = percentage < 75;

    return {
      id: sc.course.id,
      code: sc.course.courseCode,
      title: sc.course.courseTitle,
      attended,
      percentage,
      isAtRisk
    };
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-12">
      
      {/* Navbar / Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-black rounded-md flex items-center justify-center text-white font-bold">
              AU
            </div>
            <span className="font-semibold text-lg tracking-tight">Attendance SYS</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-zinc-500 hidden sm:inline-block">{student.email}</span>
            <div className="h-8 w-8 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center overflow-hidden">
              {/* Optional: Show their face scan here later */}
              <svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Welcome back, {student.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-zinc-500 mt-1">
              Matric No: <span className="font-medium text-zinc-700">{student.identifier}</span>
            </p>
          </div>
          
          {/* Primary Action Button */}
          <Link 
            href="/dashboard/student/scan" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black shadow-sm transition-colors"
          >
            <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Scan Class QR Code
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Course Progress (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Your Courses</h2>
            
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              {coursesWithStats.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  No courses found. Your form might still be pending review.
                </div>
              ) : (
                <ul className="divide-y divide-zinc-200">
                  {coursesWithStats.map((course) => (
                    <li key={course.id} className="p-6 hover:bg-zinc-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900">{course.code}</h3>
                          <p className="text-sm text-zinc-500">{course.title}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isAtRisk ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {course.percentage}% Attended
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between text-xs text-zinc-500 font-medium">
                          <span>{course.attended} Sessions Logged</span>
                          <span>{TOTAL_CLASSES} Total Sessions</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-zinc-100">
                          <div 
                            style={{ width: `${course.percentage}%` }} 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${course.isAtRisk ? 'bg-red-500' : 'bg-black'}`}
                          ></div>
                        </div>
                        {course.isAtRisk && (
                          <p className="text-xs text-red-600 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            Warning: Below 75% required threshold for exam eligibility.
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column: Status & Recent Activity */}
          <div className="space-y-6">
            
            {/* Quick Status Card */}
            <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-md">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">Biometric Status</h3>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
                <p className="ml-3 font-semibold text-lg">Face Data Active</p>
              </div>
              <p className="mt-4 text-xs text-zinc-400 leading-relaxed">
                Your device and biometrics are securely synced. You are clear to log attendance for the current semester.
              </p>
            </div>

            {/* Recent Activity Feed */}
            <div>
              <h2 className="text-xl font-semibold tracking-tight mb-4">Recent Scans</h2>
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3 py-3 border-b border-zinc-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-900">CSC301 - Lab Session</p>
                    <p className="text-xs text-zinc-500">Today, 10:15 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-zinc-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-900">MTH301 - Lecture</p>
                    <p className="text-xs text-zinc-500">Yesterday, 1:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 last:border-0 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-900 text-red-700">BIO101 - Missed</p>
                    <p className="text-xs text-zinc-500">Monday, 9:00 AM</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}