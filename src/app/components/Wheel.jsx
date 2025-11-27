// "use client";

// import { useEffect, useRef } from "react";

// export default function Wheel({ prizes = [], onFinish, spinTrigger }) {
//   const canvasRef = useRef(null);

//   // REAL angle & velocity
//   const ang = useRef(0);
//   const angVel = useRef(0);

//   const friction = 0.985;
//   const PI = Math.PI;
//   const TAU = 2 * PI;

//   // Generate random HEX color
//   const randomColor = () => {
//     const h = Math.floor(Math.random() * 360);
//     return `hsl(${h}, 85%, 55%)`;
//   };

//   // Assign random colors once
//   const coloredPrizes = prizes.map((p) => ({
//     ...p,
//     color: p.color || randomColor(),
//   }));

//   const drawSector = (ctx, sector, i, arc, rad) => {
//     const angle = arc * i;
//     ctx.save();

//     // Sector fill
//     ctx.beginPath();
//     ctx.fillStyle = sector.color;
//     ctx.moveTo(rad, rad);
//     ctx.arc(rad, rad, rad, angle, angle + arc);
//     ctx.lineTo(rad, rad);
//     ctx.fill();

//     // Text
//     ctx.translate(rad, rad);
//     ctx.rotate(angle + arc / 2);
//     ctx.textAlign = "right";
//     ctx.fillStyle = "#000";
//     ctx.font = "bold 18px sans-serif";
//     ctx.fillText(sector.name || sector.label, rad - 10, 10);

//     ctx.restore();
//   };

//   const getIndex = (ang, tot) =>
//     Math.floor(tot - (ang / TAU) * tot) % tot;

//   // MAIN ANIMATION LOOP
//   useEffect(() => {
//     if (coloredPrizes.length === 0) return;

//     const ctx = canvasRef.current.getContext("2d");
//     const canvas = ctx.canvas;
//     const dia = canvas.width;
//     const rad = dia / 2;
//     const tot = coloredPrizes.length;
//     const arc = TAU / tot;

//     const render = () => {
//       ctx.clearRect(0, 0, dia, dia);
//       coloredPrizes.forEach((sec, i) => drawSector(ctx, sec, i, arc, rad));
//     };

//     render();

//     let frameId;
//     const animate = () => {
//       if (angVel.current > 0) {
//         angVel.current *= friction;
//         if (angVel.current < 0.002) angVel.current = 0;

//         ang.current = (ang.current + angVel.current) % TAU;
//         canvas.style.transform = `rotate(${ang.current - PI / 2}rad)`;

//         // Stop event
//         if (angVel.current === 0) {
//           const idx = getIndex(ang.current, tot);
//           onFinish && onFinish(coloredPrizes[idx], idx);
//         }
//       }
//       frameId = requestAnimationFrame(animate);
//     };

//     animate();
//     return () => cancelAnimationFrame(frameId);
//   }, [prizes]);

//   // TRIGGER SPIN
//   useEffect(() => {
//     if (!spinTrigger) return;
//     angVel.current = Math.random() * 0.35 + 0.25;
//   }, [spinTrigger]);

//   return (
//     <div className="flex flex-col items-center justify-center relative">

//       {/* POINTER / JARUM */}
//       <div
//         className="absolute top-[-10px] z-20 w-0 h-0"
//         style={{
//           borderLeft: "10px solid transparent",
//           borderRight: "10px solid transparent",
//           borderTop: "35px solid yellow",
//         }}
//       />

//       {/* SPIN WHEEL CANVAS */}
//       <div className="relative w-[400px] h-[400px]">
//         <canvas
//           ref={canvasRef}
//           width={400}
//           height={400}
//           className="rounded-full shadow-xl will-change-transform"
//         ></canvas>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";

export default function Wheel({ prizes = [], onFinish, spinTrigger, targetIndex }) {
  const canvasRef = useRef(null);

  // ANGLES (tidak pakai state agar smooth)
  const ang = useRef(0);
  const angVel = useRef(0);

  const [hasFinished, setHasFinished] = useState(false);

  const friction = 0.985;
  const PI = Math.PI;
  const TAU = 2 * PI;

  // Sound
  const tickSound = typeof Audio !== "undefined" ? new Audio("/tick.mp3") : null;
  const finishSound = typeof Audio !== "undefined" ? new Audio("/finish.mp3") : null;

  // random color
  const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 100%, 55%)`;

  const coloredPrizes = prizes.map((p) => ({
    ...p,
    color: p.color || randomColor(),
  }));

  const drawSector = (ctx, sector, i, arc, rad) => {
    const angle = arc * i;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, angle, angle + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();

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

    let lastTickSector = -1;

    const animate = () => {
      if (angVel.current > 0) {
        angVel.current *= friction;

        ang.current += angVel.current;
        canvas.style.transform = `rotate(${ang.current - PI / 2}rad)`;

        // Tick sound
        const sector = Math.floor(coloredPrizes.length - (ang.current / TAU) * coloredPrizes.length) % coloredPrizes.length;
        if (sector !== lastTickSector) {
          tickSound && tickSound.play();
          lastTickSector = sector;
        }

        // Stop
        if (angVel.current < 0.002) {
          angVel.current = 0;

          // pastikan benar2 stop (biar tidak lompat sektor lagi)
          const finalAngle = ang.current % TAU;

          const idx = Math.floor(
            coloredPrizes.length - (finalAngle / TAU) * coloredPrizes.length
          ) % coloredPrizes.length;

          finishSound && finishSound.play();

          if (!hasFinished) {
            setHasFinished(true);

            // delay sedikit supaya benar2 berhenti (opsional tapi recommended)
            setTimeout(() => {
              onFinish && onFinish(coloredPrizes[idx], idx);
            }, 100);
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [prizes]);

  // SPIN TRIGGER — arahkan ke targetIndex
  useEffect(() => {
    if (!spinTrigger || targetIndex === null) return;

    setHasFinished(false);

    const total = prizes.length;

    let targetAngle = computeTargetAngle(targetIndex, total);

    const extraSpins = 6;
    const finalAngle = targetAngle + extraSpins * TAU;

    const diff = finalAngle - ang.current;
    angVel.current = diff / 60;

  }, [spinTrigger, targetIndex]);

  return (
    <div className="flex flex-col items-center justify-center relative">

      {/* Pointer */}

      <div
        className="absolute top-[-0px] z-20 w-0 h-0 "
        style={{
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "35px solid red",
        }}
      />
      <div className="relative w-[400px] h-[400px]  ">

        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="rounded-full w-[300px] h-[300px] md:w-[400px] md:h-[400px] mx-auto shadow-xl border-8 border-pink-700 shadow-pink-900 will-change-transform"
        ></canvas>
      </div>


    </div>
  );
}

