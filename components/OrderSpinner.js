"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function OrderSpinner({ size = 64, label }) {
  const ring1 = useRef(null);
  const ring2 = useRef(null);
  const ring3 = useRef(null);
  const core = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });
    gsap.to(ring1.current, { rotation: 360, duration: 2.2, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
    gsap.to(ring2.current, { rotation: -360, duration: 3, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
    gsap.to(ring3.current, { rotation: 360, duration: 4.2, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
    tl.to(core.current, { scale: 1.25, opacity: 0.5, duration: 0.8, ease: "sine.inOut", yoyo: true, repeat: -1 });

    return () => {
      gsap.killTweensOf([ring1.current, ring2.current, ring3.current, core.current]);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label={label || "Loading"}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <circle
          ref={ring1}
          cx="50"
          cy="50"
          r="44"
          stroke="#5b6bff"
          strokeWidth="2"
          strokeDasharray="8 10"
          opacity="0.7"
        />
        <circle
          ref={ring2}
          cx="50"
          cy="50"
          r="33"
          stroke="#3fe0d0"
          strokeWidth="2"
          strokeDasharray="5 8"
          opacity="0.6"
        />
        <circle
          ref={ring3}
          cx="50"
          cy="50"
          r="22"
          stroke="#8b96ff"
          strokeWidth="1.5"
          strokeDasharray="3 6"
          opacity="0.5"
        />
        <circle ref={core} cx="50" cy="50" r="7" fill="#8b96ff" />
      </svg>
      {label && <span className="text-xs text-white/50">{label}</span>}
    </div>
  );
}
