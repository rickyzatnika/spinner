import  {connectDB}  from "@/lib/db";
import { generateCode } from "@/lib/generateCode";
import Registration from "@/models/Registration";


export async function POST(req) {
  try {
    await connectDB();

    const { name, email, phone, storeName } = await req.json();

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
