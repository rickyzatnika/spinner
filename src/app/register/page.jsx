"use client";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    storeName: "",
  });

  const [code, setCode] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [alreadyRegisteredMsg, setAlreadyRegisteredMsg] = useState(null);

  useEffect(() => {
    // Use an existing device id if available
    let id = null;
    try {
      id = localStorage.getItem('spinner_device_id');
    } catch (e) {
      // localStorage might be unavailable in some environments — ignore
    }

    if (!id && typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      id = window.crypto.randomUUID();
      try { localStorage.setItem('spinner_device_id', id); } catch (e) {}
    }

    setDeviceId(id);

    // If device already has a stored registration code, show it to user
    try {
      const storedCode = localStorage.getItem('spinner_registration_code');
      if (storedCode) setCode(storedCode);
    } catch (e) {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form, deviceId };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      setCode(data.code);
      // store code locally so same device won't register again
      try { localStorage.setItem('spinner_registration_code', data.code); } catch (e) {}

      if (data.alreadyRegistered) {
        setAlreadyRegisteredMsg('Perangkat ini sudah pernah terdaftar. Kode yang ada sebelumnya ditampilkan di bawah.');
      }

      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        storeName: "",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 p-6">


      {!code ? (
        <>

          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Isi Form berikut untuk mendapatkan kode wheel spin
          </h1>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-4 bg-white/10 p-6 rounded-xl backdrop-blur"
          >
            {["name", "email", "phone", "storeName"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={
                  field === "name"
                    ? "Nama Lengkap"
                    : field === "email"
                      ? "Email"
                      : field === "phone"
                        ? "No. Handphone"
                        : "Nama Toko"
                }
                className="w-full p-3 rounded-full bg-white text-black focus:ring-2 focus:ring-pink-300 outline-none"
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
                required
              />
            ))}

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold p-3 rounded-xl mt-3"
            >
              Submit
            </button>
            <p className="text-xs text-white/70 mt-2">Perhatian: setiap perangkat hanya dapat mendaftar 1x. Jika perangkat sudah memiliki kode, form akan menyembunyikan dan menampilkan kode tersebut.</p>
          </form>
        </>
      ) : (
        <div className="bg-white/20 p-6 rounded-xl text-center backdrop-blur">
          {alreadyRegisteredMsg && (
            <p className="text-sm text-yellow-200 mb-2">{alreadyRegisteredMsg}</p>
          )}
          <h2 className="text-lg font-bold text-white">Kode Wheel Spin Anda:</h2>
          <p className="text-4xl font-bold text-yellow-300 mt-2">{code}</p>
          <p className="text-white mt-4">Tunjukkan kode ini kepada Crew/Petugas.</p>
        </div>
      )}
    </div>
  );
}
