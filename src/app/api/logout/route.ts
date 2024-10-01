import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  // Clear the token cookie
  response.cookies.set("token", "", { maxAge: 0, path: "/" });

  return response;
}
