import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { password } = await request.json()

  const authPassword = process.env.AUTH_PASSWORD
  const authSecret = process.env.AUTH_SECRET

  if (!authPassword || !authSecret) {
    return NextResponse.json(
      { ok: false, error: "Auth not configured" },
      { status: 500 }
    )
  }

  if (password !== authPassword) {
    return NextResponse.json(
      { ok: false, error: "Invalid password" },
      { status: 401 }
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set("x_scanner_auth", authSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete("x_scanner_auth")
  return response
}
