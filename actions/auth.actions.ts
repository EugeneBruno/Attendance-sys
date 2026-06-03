/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/auth.actions.ts
"use server"

import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function registerUser(data: any) {
  try {
    const { name, email, password, role, matricNumber } = data;

    //set identifier based on role
    const identifier = role === 'STUDENT' ? matricNumber : email;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { identifier: identifier }
        ]
      }
    });

    if (existingUser) {
      return { error: "A user with this email or matriculation number already exists." };
    }

    //  Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Save to Database
    const newUser = await prisma.user.create({
      data: {
        fullName: name,
        email: email,
        identifier: identifier,
        passwordHash: hashedPassword,
        role: role,
        matricNumber: role === 'STUDENT' ? matricNumber : null,
      }
    });

    return { success: true };

  } catch (error) {
    console.error("Registration Error:", error);
    return { error: "An unexpected error occurred during registration." };
  }
}