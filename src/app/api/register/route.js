import  {connectDB}  from "@/lib/db";
import { generateCode } from "@/lib/generateCode";
import Registration from "@/models/Registration";




export async function GET() {
  try {
    await connectDB();

    const users = await Registration.find();

    return Response.json({users});
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


