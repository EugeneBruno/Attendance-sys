"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { QRCodeCanvas } from "qrcode.react";

type Course = {
  id: string;
  courseCode: string;
  courseTitle: string;
};

export default function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [qrToken, setQrToken] = useState("");

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();

      if (res.ok) {
        setCourses(data.courses || []);
      } else {
        alert(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching courses");
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  async function createCourse() {
    if (!courseCode || !courseTitle) {
      alert("Fill all course fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseCode,
          courseTitle,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Course created successfully");
        setCourseCode("");
        setCourseTitle("");
        fetchCourses();
      } else {
        alert(data.message || "Failed to create course");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating course");
    }

    setLoading(false);
  }

  async function startAttendance() {
    if (!selectedCourseId) {
      alert("Select a course first");
      return;
    }

    if (durationMinutes < 1 || durationMinutes > 30) {
      alert("Duration must be between 1 and 30 minutes");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/attendance/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          durationMinutes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          `Attendance Started!\n\nQR Token:\n${data.session.qrToken}\n\nExpires:\n${data.session.expiresAt}`
        );
        setQrToken(data.session.qrToken);
      } else {
        alert(data.message || "Failed to start attendance");
      }
    } catch (error) {
      console.error(error);
      alert("Error starting attendance");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>

          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* Create Course */}
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">Register Course</h2>

          <input
            type="text"
            placeholder="Course Code (e.g CSC301)"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <input
            type="text"
            placeholder="Course Title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <button
            onClick={createCourse}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Create Course
          </button>
        </section>

        {/* Courses */}
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">Your Courses</h2>

          {courses.length === 0 ? (
            <p>No courses yet</p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`border p-4 rounded cursor-pointer ${
                    selectedCourseId === course.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-zinc-300"
                  }`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <p className="font-bold">{course.courseCode}</p>
                  <p>{course.courseTitle}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Attendance */}
        <section className="bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold">Start Attendance</h2>

          <input
            type="number"
            min={1}
            max={30}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full border p-3 rounded"
          />

          <button
            onClick={startAttendance}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Attendance
          </button>

          {qrToken && (
            <div className="bg-white p-6 rounded shadow text-center space-y-4">
              <h2 className="text-xl font-semibold">Attendance QR Code</h2>

              <div className="flex justify-center">
                <QRCodeCanvas value={qrToken} size={250} />
              </div>

              <p className="text-xs break-all text-zinc-500">{qrToken}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}