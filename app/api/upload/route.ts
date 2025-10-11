import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const res = await fetch("https://v0-cloudinary-image-upload-mu.vercel.app/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
