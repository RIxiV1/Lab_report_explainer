import { useState, useEffect, useRef } from "react";

// Animates a numeric value from 0 to `target` over `duration` ms.
// Returns the current frame's interpolated value.
//
// Honours `prefers-reduced-motion` — users who've opted out of
// animation see the final number immediately, no count-up. Without
// this, an animated TMSC reading would push past WCAG 2.1 AA (motion
// without an off-switch can trigger vestibular symptoms).
//
// Uses requestAnimationFrame + ease-out cubic for a slow-decel feel
// that reads as "result calculated" rather than "casino spin."
export function useCountUp(target, { duration = 1200 } = {}) {
  const [value, setValue] = useState(target ?? 0);
  const startedAtRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (target == null) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setValue(target);
      return;
    }

    cancelAnimationFrame(rafRef.current);
    setValue(0);
    startedAtRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startedAtRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      if (t < 1) {
        setValue(target * eased);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target); // snap to exact target on final frame
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}
