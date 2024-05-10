import prisma from "@/lib/prisma";
import { signJWT } from "@/lib/token";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user || !(await compare(password, user.password))) {
      console.log("invalid username or password");
      return new NextResponse(
        { error: "invalid username or password" },
        { status: 401 }
      );
    }

    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

    const token = await signJWT(
      { sub: user.id },
      { exp: `${JWT_EXPIRES_IN}m` }
    );

    const tokenMaxAge = parseInt(JWT_EXPIRES_IN) * 60;

    const cookieOptions = {
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV !== "development",
      maxAge: tokenMaxAge,
    };

    const response = new NextResponse(
      JSON.stringify({
        status: "success",
        token,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

    await Promise.all([
      response.cookies.set(cookieOptions),
      response.cookies.set({
        name: "logged-in",
        value: "true",
        maxAge: tokenMaxAge,
      }),
    ]);

    return response;
  } catch (error) {
    return new NextRequest({ error: "Error", error }, { status: 500 });
  }
}
