import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      role: "ADMIN" | "LECTURER" | "STUDENT";
    };

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Only students can enroll in courses" },
        { status: 403 }
      );
    }

    const { courseCode } = await req.json();

    if (!courseCode) {
      return NextResponse.json(
        { message: "Course code is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findFirst({
      where: { courseCode },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    const existingEnrollment = await prisma.studentCourse.findFirst({
      where: {
        studentId: user.id,
        courseId: course.id,
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { message: "You are already enrolled in this course" },
        { status: 409 }
      );
    }

    const enrollment = await prisma.studentCourse.create({
      data: {
        studentId: user.id,
        courseId: course.id,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json(
      {
        message: "Course enrollment successful",
        enrollment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}