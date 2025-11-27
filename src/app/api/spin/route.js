


import { connectDB } from "@/lib/db";
import Prize from "@/models/Prize";
import Registration from "@/models/Registration";
import SpinLog from "@/models/SpinLog";

// export async function POST(req) {
//   try {
//     await connectDB();

//     const { code } = await req.json();

//     const user = await Registration.findOne({ code });

//     if (!user) {
//       return Response.json({ success: false, message: "Kode tidak ditemukan." });
//     }

//     if (user.isUsed) {
//       return Response.json({ success: false, message: "Kode sudah digunakan." });
//     }

//     // ---- Random Hadiah Berdasarkan Weight ---- //
//     const prizes = await Prize.find({});
//     let weighted = [];

//     prizes.forEach((p) => {
//       for (let i = 0; i < p.weight; i++) {
//         weighted.push(p);
//       }
//     });

//     const selected = weighted[Math.floor(Math.random() * weighted.length)];

//     // Simpan hasil spin
//     user.isUsed = true;
//     user.spinResult = selected.name;
//     await user.save();

//     await SpinLog.create({
//       code,
//       userId: user._id,
//       prize: selected.name,
//       prizeId: selected._id,
//     });

//     // Kirim info posisi sektor untuk wheel
//     const prizeIndex = prizes.findIndex((p) => p._id.toString() === selected._id.toString());

//     return Response.json({
//       success: true,
//       prize: selected.name,
//       index: prizeIndex,
//     });

//   } catch (e) {
//     return Response.json({ success: false, error: e.message });
//   }
// }


export async function POST(req) {
  try {
    await connectDB();

    const { code, prize: prizeName, prizeId } = await req.json();

    const user = await Registration.findOne({ code });
    if (!user) return Response.json({ success: false, message: "Kode tidak ditemukan." });
    if (user.isUsed) return Response.json({ success: false, message: "Kode sudah digunakan." });

    // Ambil hadiah berdasarkan ID yang dikirim frontend
    const selected = await Prize.findById(prizeId);
    if (!selected) return Response.json({ success: false, message: "Hadiah tidak valid." });

    // Simpan hasil spin sesuai frontend
    user.isUsed = true;
    user.spinResult = prizeName;
    await user.save();

    await SpinLog.create({
      code,
      userId: user._id,
      prize: prizeName,
      prizeId: selected._id,
    });

    // Kirim index untuk wheel
    const prizes = await Prize.find({});
    const prizeIndex = prizes.findIndex(p => p._id.toString() === selected._id.toString());

    return Response.json({
      success: true,
      prize: prizeName,
      index: prizeIndex,
    });

  } catch (e) {
    return Response.json({ success: false, error: e.message });
  }
}
