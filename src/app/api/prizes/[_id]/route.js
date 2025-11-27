
import { connectDB } from "@/lib/db";
import Prize from "@/models/Prize";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req = NextRequest, { params: { _id } }) {
  await connectDB();

  try {
    const prizes = await Prize.findOne({_id});
    return new NextResponse(JSON.stringify(prizes), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify(error.message), { status: 500 });
  }
}



export async function PUT(req = NextRequest, { params: { _id } }) {
  await connectDB();
  const body = await req.json();

  try {
    // Cek apakah nama sudah ada pada database
    const existingPrize = await Prize.findOne({
      name: body.name,
      
      _id: { $ne: _id },
    });

    if (existingPrize) {
      return new NextResponse(
        JSON.stringify({
          message: "Hadiah sudah terdaftar",
        }),
        { status: 400 }
      );
    }

    const updatePrize = await Prize.findByIdAndUpdate(
      _id,
      { $set: { ...body } },
      { new: true }
    );

    return new NextResponse(JSON.stringify(updatePrize), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify(error.message), { status: 500 });
  }
}



export async function DELETE(req = NextRequest, { params: { _id } }) {
  await await connectDB();

  try {
    await Prize.findOneAndDelete({_id});
    return new NextResponse("Prize deleted successfully", { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify(error.message), { status: 500 });
  }
}
