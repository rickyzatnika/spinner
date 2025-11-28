export async function triggerConfetti(duration = 2000) {
  // dynamic import so this module doesn't break SSR
  const confettiModule = await import('canvas-confetti');
  const confetti = confettiModule.default || confettiModule;

  const end = Date.now() + duration;

  // multiple bursts for nicer effect
  (function frame() {
    // basic burst configuration, random spread + origin
    confetti({
      particleCount: 7,
      startVelocity: 40,
      spread: 120,
      ticks: 350,
      origin: { x: Math.random(), y: Math.random() * 0.5 },
      colors: ['#ff0a54', '#ffdd57', '#ff7ab6', '#7bed9f', '#3fe0ff', '#ffd166', '#a55eea']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
