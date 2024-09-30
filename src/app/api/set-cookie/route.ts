import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { token } = await request.json();

  // Set the token in the cookies with appropriate options
  cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to secure in production
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return NextResponse.json({ message: "Token stored in cookies successfully" });
}
