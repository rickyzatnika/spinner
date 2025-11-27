"use client";

import { useState, useEffect } from "react";
import Wheel from "../components/Wheel";
import Image from "next/image";

export default function SpinPage() {
  const [code, setCode] = useState("");
  const [valid, setValid] = useState(null);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizes, setPrizes] = useState([]);
  const [spinIndex, setSpinIndex] = useState(null);
  const [spinTrigger, setSpinTrigger] = useState(false);

  // Ambil prize dari DB
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/prizes`)
      .then((res) => res.json())
      .then((data) => {
        setPrizes(data.prizes);
      });
  }, []);

  const validateCode = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/validate-code`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    setValid(await res.json());
  };

  const doSpin = async () => {
    setIsSpinning(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spin`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    const data = await res.json();


    setSpinIndex(data.index); // penting untuk animasi
    setIsSpinning(false);
  };

  return (
    <div className="w-full h-screen p-6 bg-gradient-to-br from-purple-600 to-pink-600 flex flex-col items-center justify-center gap-6">

      <div>
        <Image src="/goodluck.png" alt="Logo" width={450} height={450} priority={true} className="object-cover animate-pulse" />
      </div>

      <div className="w-full md:w-4/5 mx-auto flex flex-col md:flex-row gap-0 md:gap-8 justify-between">
        <div className="w-full ">
          <Wheel
            prizes={prizes}
            spinTrigger={spinTrigger}
            targetIndex={spinIndex}
            onFinish={(prize, index) => {
              console.log("FINISHED:", prize);

              // ⬇ hasil baru muncul setelah wheel berhenti
              setSpinResult({
                success: true,
                prize: prize.name,
                index,
              });
            }}
          />

          {spinResult?.success && (
            <div className="mt-10 animate-bounce text-white text-center">
              <p className="text-3xl font-bold">Selamat Anda Mendapatkan!</p>
              <p className="text-5xl font-extrabold">{spinResult.prize}</p>
            </div>
          )}
        </div>


        <div className="w-full ">
          {/* Input */}
          <div className="bg-white/20 p-6 rounded-xl backdrop-blur w-full max-w-md mt-3 md:mt-8">

            <input
              type="text"
              maxLength={4}
              className="w-full p-3 rounded-lg mb-3 bg-white text-black text-center text-xl md:text-2xl"
              placeholder="Masukkan Kode"
              onChange={(e) => setCode(e.target.value)}
            />

            <button
              onClick={validateCode}
              className="w-full bg-pink-600 text-white p-3 rounded-lg font-bold"
            >
              Cek Kode
            </button>

            {valid?.valid && !isSpinning && !spinResult && (
              <button
                onClick={async () => {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spin`, {
                    method: "POST",
                    body: JSON.stringify({ code }),
                  });

                  const data = await res.json();

                  // Jangan langsung setSpinResult
                  setSpinIndex(data.index);     // target untuk animasi
                  setSpinTrigger(Date.now());   // trigger spin
                }}
                className="w-full mt-4 bg-yellow-400 text-black p-3 rounded-lg font-bold"
              >
                PUTAR
              </button>
            )}
            {!valid?.valid && valid?.valid === false && (
              <p className="text-white bg-red-800 p-2 text-center mt-4">Kode tidak valid atau sudah digunakan.</p>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
