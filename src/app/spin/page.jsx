"use client";

import { useState, useEffect } from "react";
import Wheel from "../components/Wheel";
import { triggerConfetti } from "../../lib/confetti";
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

  // const doSpin = async () => {
  //   setIsSpinning(true);

  //   const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spin`, {
  //     method: "POST",
  //     body: JSON.stringify({ code }),
  //   });

  //   const data = await res.json();


  //   setSpinIndex(data.index); // penting untuk animasi
  //   setIsSpinning(false);
  // };

  return (
    <div className="w-full md:w-6/12 h-full md:h-screen py-2 px-6 backdrop-blur-md flex flex-col bg-pink-200/10 items-center justify-between md:justify-center gap-6  overflow-hidden">

    <div className="w-full flex flex-col  mt-3 items-center gap-4">
      <div>
        <Image src="/goodluck.png" alt="Logo" width={450} height={450} priority={true} className="object-cover" />
      </div>
      <div className="w-full ">
        <Wheel
          prizes={prizes}
          spinTrigger={spinTrigger}
          targetIndex={spinIndex} // target untuk wheel berhenti


          onFinish={async (prize, index) => {
            setSpinResult({ success: true, prize: prize.name, index });

            // Play confetti celebration (non-blocking)
            try { triggerConfetti(2000); } catch (e) { /* ignore */ }

            // Kirim hasil ke backend
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spin`, {
              method: "POST",
              body: JSON.stringify({
                code,
                prize: prize.name,
                prizeId: prize._id,
              }),
            });


          }}
        />

        {spinResult?.success && (
          <div className="mt-10 animate-bounce text-white text-center">
            <p className="text-2xl md:text-3xl font-bold">Selamat Anda Mendapatkan!</p>
            <p className="text-xl md:text-5xl font-extrabold">{spinResult.prize}</p>
          </div>
        )}
      </div>
     </div>

      <div className="w-full ">

        <div className="bg-white/20 p-3 md:p-6 rounded-xl backdrop-blur w-full max-w-md mx-auto mt-3 md:mt-8">

          <input
            type="text"
            maxLength={4}
            className="w-full p-3 rounded-lg mb-3 bg-white text-black text-center text-lg md:text-2xl"
            placeholder="Masukkan Kode"
            onChange={(e) => setCode(e.target.value)}
          />

          {!valid?.valid && (
            <button
            onClick={validateCode}
            className="w-full bg-pink-600 text-white p-3 rounded-lg font-bold"
          >
            Submit
          </button>
          )}

          {valid?.valid && !isSpinning && !spinResult && (
            <button
              onClick={() => {
                // 1️⃣ Random pilih hadiah di frontend
                const randomIndex = Math.floor(Math.random() * prizes.length);
                setSpinIndex(randomIndex);

                // 2️⃣ Trigger animasi wheel
                setSpinTrigger(Date.now());
              }}
              className="w-full mt-4 bg-yellow-400 text-black p-3 rounded-lg font-bold"
            >
              PUTAR
            </button>
          )}
          {valid?.valid && spinResult && (
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="w-full mt-4 bg-blue-600 text-white p-3 rounded-lg font-bold"
            >
              Refresh
            </button>
          )}
          

          {!valid?.valid && valid?.valid === false &&  (
            <p className="text-white bg-red-800 p-2 text-center mt-4">Kode tidak valid atau sudah digunakan.</p>
          )}
        </div>

      </div>

    </div>
  );
}
