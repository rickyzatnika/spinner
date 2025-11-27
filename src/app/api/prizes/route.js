import { NextResponse } from "next/server";
import Prize from "@/models/Prize";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    const prizes = await Prize.find().sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      prizes,
    });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error GET prizes" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { name, weight, image } = await req.json();

    if (!name || weight === undefined) {
      return NextResponse.json(
        { success: false, message: "Name dan weight wajib diisi." },
        { status: 400 }
      );
    }

    const newPrize = await Prize.create({
      name,
      weight,
      image: image || "", // image opsional
    });

    return NextResponse.json({
      success: true,
      prize: newPrize,
    });
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error POST prize" },
      { status: 500 }
    );
  }
}
