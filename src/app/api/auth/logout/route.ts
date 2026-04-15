import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const response = NextResponse.redirect(`${baseUrl}/`);

  response.cookies.delete("phoenix_session");
  response.cookies.delete("phoenix_user");

  return response;
}
