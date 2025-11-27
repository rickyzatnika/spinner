
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";


export async function POST(req) {
  try {
    await connectDB();

    const { code } = await req.json();

    const reg = await Registration.findOne({ code });

    if (!reg) {
      return Response.json({ valid: false, message: "Kode tidak ditemukan." });
    }

    if (reg.isUsed) {
      return Response.json({ valid: false, message: "Kode sudah dipakai." });
    }

    return Response.json({ valid: true, user: reg });
  } catch (e) {
    return Response.json({ valid: false, error: e.message });
  }
}
