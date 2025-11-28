/**
 * Trigger confetti bursts in the browser.
 * @param {Object|number} options - Either duration (ms) or options object.
 * Options: { duration, origin: {x, y}, particleCount }
 */
export async function triggerConfetti(options = {}) {
  // allow calling with a number for backward-compat
  const opts = typeof options === 'number' ? { duration: options } : options;
  const { duration = 2000, origin = null, particleCount = 8 } = opts;
  // dynamic import so this module doesn't break SSR
  const confettiModule = await import('canvas-confetti');
  const confetti = confettiModule.default || confettiModule;

  const end = Date.now() + duration;

  // multiple bursts for nicer effect
  (function frame() {
    // basic burst configuration, random spread + origin
    confetti({
      particleCount,
      startVelocity: 40,
      spread: 120,
      ticks: 350,
      origin: origin || { x: Math.random(), y: Math.random() * 0.5 },
      colors: ['#ff0a54', '#ffdd57', '#ff7ab6', '#7bed9f', '#3fe0ff', '#ffd166', '#a55eea']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
