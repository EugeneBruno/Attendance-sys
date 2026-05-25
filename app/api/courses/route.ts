import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      role: "ADMIN" | "LECTURER" | "STUDENT";
    };

    if (user.role !== "LECTURER" && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      where: {
        lecturerId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

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

    if (user.role !== "LECTURER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only lecturers can create courses" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseCode, courseTitle } = body;

    if (!courseCode || !courseTitle) {
      return NextResponse.json(
        { message: "Course code and course title are required" },
        { status: 400 }
      );
    }

    const existingCourse = await prisma.course.findFirst({
      where: {
        courseCode,
        lecturerId: user.id,
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { message: "You already registered this course" },
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        courseCode,
        courseTitle,
        lecturerId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: "Course created successfully",
        course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}