import  {connectDB}  from "@/lib/db";
import { generateCode } from "@/lib/generateCode";
import Registration from "@/models/Registration";




export async function GET(req) {
  try {
    await connectDB();

    // support pagination: ?page=1&limit=10
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    const totalCount = await Registration.countDocuments();
    const users = await Registration.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({ success: true, users, page, limit, totalCount, totalPages });
  } catch (err) {
    console.error("GET ERROR:", err);
    return Response.json(
      { success: false, message: "Server error GET prizes" },
      { status: 500 }
    );
  }
}




export async function POST(req) {
  try {
    await connectDB();

    const { name, email, phone, storeName, deviceId } = await req.json();

    // If a deviceId is provided, check to prevent duplicate registrations from same device
    if (deviceId) {
      const already = await Registration.findOne({ deviceId });
      if (already) {
        // Return existing code but mark it's an already-registered device
        return Response.json({ success: true, code: already.code, alreadyRegistered: true });
      }
    }

    // Generate unique 4 digit code
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = generateCode();
      const exists = await Registration.findOne({ code });
      if (!exists) isUnique = true;
    }

    // Simpan data user
    const newReg = await Registration.create({
      name,
      email,
      phone,
      storeName,
      deviceId,
      code,
    });

    return Response.json({
      success: true,
      code: newReg.code,
    });
  } catch (error) {
    console.log(error);
    return Response.json({ success: false, error: error.message });
  }
}


