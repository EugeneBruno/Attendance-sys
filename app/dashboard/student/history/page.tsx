import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function StudentHistoryPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== "STUDENT") redirect("/dashboard/lecturer");

  const records = await prisma.attendanceRecord.findMany({
    where: {
      studentId: session.user.id,
    },
    orderBy: {
      scannedAt: "desc",
    },
    include: {
      session: {
        include: {
          course: {
            include: {
              lecturer: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Attendance History
          </h1>
          <p className="text-slate-500 mt-1">
            View all attendance records you have successfully marked.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Attendance Records
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-600">
                    Course
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-600">
                    Lecturer
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-600">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-600">
                    Time
                  </th>
                  <th className="text-center p-4 font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-slate-500"
                    >
                      No attendance history yet.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">
                          {record.session.course.courseCode}
                        </p>
                        <p className="text-slate-500">
                          {record.session.course.courseTitle}
                        </p>
                      </td>

                      <td className="p-4 text-slate-600">
                        {record.session.course.lecturer?.fullName ||
                          "Not assigned"}
                      </td>

                      <td className="p-4 text-slate-600">
                        {record.scannedAt.toLocaleDateString("en-NG", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="p-4 text-slate-600">
                        {record.scannedAt.toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          Present
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}