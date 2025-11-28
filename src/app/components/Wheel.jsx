"use client";

import { useEffect, useRef, useState } from "react";
import { triggerConfetti } from "../../lib/confetti";

export default function Wheel({ prizes = [], onFinish, spinTrigger, targetIndex }) {
  const canvasRef = useRef(null);

  // ANGLES (tidak pakai state agar smooth)
  const ang = useRef(0);
  const angVel = useRef(0);
  const requestRef = useRef();

  const [isSpinning, setIsSpinning] = useState(false);

  const friction = 0.990;
  const PI = Math.PI;
  const TAU = 2 * PI;

  // Sound
  const tickSound = typeof Audio !== "undefined" ? new Audio("/tick.mp3") : null;
  const finishSound = typeof Audio !== "undefined" ? new Audio("/finish.mp3") : null;

  // random color - assign once, outside effects
  const randomColor = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA502", "#FF1493", "#00D9FF", "#FFD700", "#32CD32", "#FF69B4", "#00CED1"];

  const coloredPrizes = prizes.map((p, i) => ({
    ...p,
    color: p.color || randomColor[i % randomColor.length],
  }));

  const drawSector = (ctx, sector, i, arc, rad) => {
    const angle = arc * i;

    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, angle, angle + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();
    ctx.save();
    ctx.translate(rad, rad);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";

    ctx.font = "bold 16px sans-serif";
    ctx.fillText(sector.name, rad - 10, 10);

    ctx.restore();
  };

  // Kunci: hitung angle target sektor
  const computeTargetAngle = (index, total) => {
    const arc = TAU / total;
    let targetAngle = TAU - arc * index - arc / 2;
    return targetAngle;
  };

  // Simpan ke database
  const saveSpinResult = async (prize, index) => {
    try {
      const response = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prize: prize.name,
          prizeId: prize.id,
          index: index,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error("Failed to save spin result");
      }
    } catch (error) {
      console.error("Error saving spin result:", error);
    }
  };

  // Stop tick sound loop
  const stopTickSound = () => {
    if (tickSound) {
      tickSound.pause();
      tickSound.currentTime = 0;
    }
  };

  useEffect(() => {
    if (coloredPrizes.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    const canvas = ctx.canvas;
    const dia = canvas.width;
    const rad = dia / 2;
    const tot = coloredPrizes.length;
    const arc = TAU / tot;

    const render = () => {
      ctx.clearRect(0, 0, dia, dia);
      coloredPrizes.forEach((sec, i) => drawSector(ctx, sec, i, arc, rad));
    };

    render();

    let tickInterval = null;

    const animate = () => {
      if (angVel.current > 0.002) {
        angVel.current *= friction;

        ang.current += angVel.current;
        canvas.style.transform = `rotate(${ang.current - PI / 2}rad)`;

        requestRef.current = requestAnimationFrame(animate);
      } else {
        // STOP - hentikan tick sound
        stopTickSound();
        if (tickInterval) clearInterval(tickInterval);

        angVel.current = 0;
        setIsSpinning(false);

        const finalAngle = ang.current % TAU;
        const idx = Math.floor(
          coloredPrizes.length - (finalAngle / TAU) * coloredPrizes.length
        ) % coloredPrizes.length;

        // Play finish sound and then trigger confetti, using the sound's duration
        if (finishSound) {
          finishSound.play().catch(() => {}).finally(() => {
            try {
              const canvas = canvasRef.current;
              // use the audio duration (seconds) if available, otherwise fallback
              const soundDurationMs = Number.isFinite(finishSound.duration) && finishSound.duration > 0 ? finishSound.duration * 1000 : null;
              const confettiDuration = soundDurationMs ? Math.max(1800, Math.round(soundDurationMs)) : 2200;

              if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
                triggerConfetti({ duration: confettiDuration, origin: { x, y }, particleCount: 12 });
              } else {
                // fallback
                triggerConfetti(confettiDuration);
              }
            } catch (e) {
              // ignore errors during confetti (do not break UI)
            }
          });
        } else {
          // if no sound, trigger a reasonable default
          try {
            const canvas = canvasRef.current;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              const x = (rect.left + rect.width / 2) / window.innerWidth;
              const y = (rect.top + rect.height / 2) / window.innerHeight;
              triggerConfetti({ duration: 2200, origin: { x, y }, particleCount: 12 });
            } else {
              triggerConfetti(2200);
            }
          } catch (e) {
            // ignore
          }
        }

        // Panggil onFinish & simpan ke DB
        if (onFinish && coloredPrizes[idx]) {
          const prize = coloredPrizes[idx];
          onFinish(prize, idx);
          saveSpinResult(prize, idx);
        }
      }
    };

    if (isSpinning) {
      // Mulai tick sound loop saat spin dimulai
      if (tickSound) {
        tickSound.loop = true;
        tickSound.play().catch(() => {});
      }
      animate();
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      stopTickSound();
    };
  }, [coloredPrizes, isSpinning]);

  // SPIN TRIGGER — arahkan ke targetIndex
  useEffect(() => {
    if (!spinTrigger || targetIndex === null || prizes.length === 0) return;

    setIsSpinning(true);

    const total = prizes.length;
    const targetAngle = computeTargetAngle(targetIndex, total);
    const extraSpins = 9;
    const finalAngle = targetAngle + extraSpins * TAU;

    const diff = finalAngle - ang.current;
    angVel.current = diff / 60;
  }, [spinTrigger, targetIndex, prizes]);

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Centered pointer / hub */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <div className="relative flex items-center justify-center">
          {/* Outer ring / badge */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full backdrop-blur-sm bg-white/30 border-[6px] border-[#fff] shadow-xl flex items-center justify-center">
            {/* Triangle indicator (pointing up) */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '28px solid #7F00FF',
                position: 'absolute',
                top: -14,
              }}
            />

            {/* Small center dot */}
            <div className="w-3 h-3 rounded-full bg-[#000] z-40" />
          </div>
        </div>
      </div>
      <div className="relative  w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full " style={{ boxShadow: "0 0 0 12px #7F00FF, 0 10px 30px rgba(0,0,0,0.6)" }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-full p-1 border-4 border-white w-[340px] h-[340px] md:w-[420px] md:h-[420px] mx-auto will-change-transform"
        ></canvas>
      </div>
    </div>
  );
}





// "use client";

// import { useEffect, useRef } from "react";

// export default function Wheel({ prizes = [], spinTrigger, targetIndex, onFinish }) {
//   const canvasRef = useRef(null);
//   const ang = useRef(0);            // current angle (rad)
//   const angVel = useRef(0);         // current angular velocity
//   const finalAngleRef = useRef(0);  // angle we want to end at (rad)
//   const requestRef = useRef();

//   const friction = 0.985;
//   const PI = Math.PI;
//   const TAU = 2 * PI;

//   // jika jarum di UI tidak tepat 270deg, atur offset di sini (radian).
//   // default 0 berarti pointerAngle = 3π/2 (atas). Jika masih meleset, ubah ke -0.17 (~-10°) atau +0.17.
//   const pointerOffset = +0.17; // tweak jika perlu (radian)

//   // Sounds (optional)
//   const tickSound = typeof Audio !== "undefined" ? new Audio("/tick.mp3") : null;
//   const finishSound = typeof Audio !== "undefined" ? new Audio("/finish.mp3") : null;

//   const drawWheel = (ctx, width, height) => {
//     const radius = Math.min(width, height) / 2 - 8;
//     ctx.clearRect(0, 0, width, height);

//     const num = prizes.length;
//     const colors = ["#FF8A8A", "#FFD966", "#8AD1FF", "#FF6F6F", "#95FF7A", "#FFA24F"];

//     prizes.forEach((p, i) => {
//       const angStart = (i * 2 * PI) / num;
//       const angEnd = ((i + 1) * 2 * PI) / num;

//       ctx.fillStyle = colors[i % colors.length];

//       ctx.beginPath();
//       ctx.moveTo(width / 2, height / 2);
//       ctx.arc(width / 2, height / 2, radius, angStart, angEnd);
//       ctx.fill();

//       // Teks nama hadiah (di tengah sektor)
//       ctx.save();
//       ctx.translate(width / 2, height / 2);
//       ctx.rotate((angStart + angEnd) / 2);
//       ctx.textAlign = "right";
//       ctx.fillStyle = "#000";
//       ctx.font = "bold 16px sans-serif";
//       ctx.fillText(p.name, radius - 12, 0);
//       ctx.restore();
//     });
//   };

//   // Animate loop: menggambar wheel saat rotasi
//   const animate = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     const width = canvas.width;
//     const height = canvas.height;

//     const num = prizes.length;
//     const arc = TAU / num;
//     const pointerAngle = (3 * PI) / 2 + pointerOffset;

//     // Jika masih berputar
//     if (Math.abs(angVel.current) > 0.0005) {
//       ang.current += angVel.current;
      
//       // Smooth deceleration dengan easing
//       const distanceLeft = (finalAngleRef.current - ang.current + TAU * 10) % (TAU * 10);
//       if (distanceLeft < TAU * 2) {
//         // Near end: slow down dengan curve smooth
//         angVel.current *= 0.96;
//       } else {
//         angVel.current *= friction;
//       }

//       // draw rotated wheel
//       ctx.save();
//       ctx.translate(width / 2, height / 2);
//       ctx.rotate(ang.current);
//       ctx.translate(-width / 2, -height / 2);
//       drawWheel(ctx, width, height);
//       ctx.restore();

//       requestRef.current = requestAnimationFrame(animate);
//     } else {
//       // --- WHEEL STOPPED SMOOTH ---
//       angVel.current = 0;

//       // Snap ke final angle
//       const final = finalAngleRef.current % TAU;
//       ang.current = final;

//       // Draw di posisi final
//       ctx.save();
//       ctx.translate(width / 2, height / 2);
//       ctx.rotate(ang.current);
//       ctx.translate(-width / 2, -height / 2);
//       drawWheel(ctx, width, height);
//       ctx.restore();

//       // Hitung final index dengan akurat
//       const rel = (pointerAngle - ang.current + TAU * 10) % TAU;
//       let finalIndex = Math.floor(rel / arc);
//       finalIndex = ((finalIndex % num) + num) % num;

//       // Play sound dengan delay micro
//       try { 
//         finishSound && finishSound.currentTime === 0 && finishSound.play().catch(() => {}); 
//       } catch (e) { }

//       // Panggil onFinish
//       setTimeout(() => {
//         if (onFinish && prizes[finalIndex]) {
//           onFinish(prizes[finalIndex], finalIndex);
//         }
//       }, 50);

//       cancelAnimationFrame(requestRef.current);
//       return;
//     }
//   };

//   // DRAW wheel sekali saat komponen mount / prizes berubah
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d");
//     drawWheel(ctx, canvas.width, canvas.height);
//   }, [prizes]);

//   // Spin trigger: hitung finalAngle berdasarkan targetIndex (presisi)
//   useEffect(() => {
//     if (!spinTrigger || prizes.length === 0) return;

//     const num = prizes.length;
//     const arc = TAU / num;

//     const target = typeof targetIndex === "number" ? targetIndex : Math.floor(Math.random() * num);
//     const pointerAngle = (3 * PI) / 2 + pointerOffset;
//     const sectorCenter = (target + 0.5) * arc;

//     // Hitung finalAngle
//     const stopAngle = pointerAngle - sectorCenter;
//     const spins = 6;
//     const finalAngle = stopAngle + spins * TAU;

//     finalAngleRef.current = finalAngle;

//     // RESET sebelum spin
//     // Jangan ubah ang.current menjadi 0 kalau kamu ingin terus melanjutkan rotasi
//     // Untuk wheel standar → set saja
//     ang.current = 0;

//     // Kecepatan awal IDEAL: smooth & tidak too fast
//     angVel.current = 0.45;

//     // Mulai animasi
//     cancelAnimationFrame(requestRef.current);
//     requestRef.current = requestAnimationFrame(animate);

//     return () => cancelAnimationFrame(requestRef.current);
//   }, [spinTrigger, targetIndex, prizes]);

//   return (
//     <div className="relative flex flex-col items-center justify-center w-[420px]">
//       {/* Pointer */}
//       <div className="absolute -top-[0] z-20">
//         <div
//           style={{
//             width: 0,
//             height: 0,
//             borderLeft: "16px solid transparent",
//             borderRight: "16px solid transparent",
//             borderTop: "30px solid red",
//           }}
//         />
//       </div>

//       {/* Wheel */}
//       <canvas
//         ref={canvasRef}
//         width={420}
//         height={420}
//         className="rounded-full shadow-xl border-[8px] border-white"
//       />
//     </div>
//   );
// }





