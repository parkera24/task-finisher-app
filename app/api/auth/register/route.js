// import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password, photo } = await req.json();

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        photo: photo,
      },
    });

    return new NextResponse(
      JSON.stringify({
        status: "success",
        data: { user: { ...user, password: undefined } },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        console.log("user with that email already exists", error.code);
        return new NextResponse(
          { error: "user with that email already exists" },
          { status: 409 }
        );
      }
    }
    return new NextResponse({ error: "Error", error }, { status: 500 });
  }
}
