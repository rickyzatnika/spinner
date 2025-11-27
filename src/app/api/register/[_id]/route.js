import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req, { params: { _id } }) {
  await connectDB();

  try {
    const user = await Registration.findById(_id);

    return new NextResponse(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify(error.message), { status: 500 });
  }
}

export async function PUT(req = NextRequest, { params: { _id } }) {
  await connectDB();
  const body = await req.json();

  try {
    // Cek apakah nama sudah ada pada database
    const existingUser = await Registration.findOne({
      name: body.name,
      
      _id: { $ne: _id },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({
          message: "Nama sudah terdaftar",
        }),
        { status: 400 }
      );
    }

    const updateUser = await Registration.findByIdAndUpdate(
      _id,
      { $set: { ...body } },
      { new: true }
    );

    return new NextResponse(JSON.stringify(updateUser), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify(error.message), { status: 500 });
  }
}



export async function DELETE(req = NextRequest, { params: { _id } }) {
  await await connectDB();

  try {
    await Registration.findOneAndDelete({_id});
    return new NextResponse("Users deleted successfully", { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify(error.message), { status: 500 });
  }
}
