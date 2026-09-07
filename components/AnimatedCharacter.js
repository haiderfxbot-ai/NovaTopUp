"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// A small robot mascot drawn entirely in SVG and animated with GSAP —
// floats gently, blinks on a random interval, and has a soft pulsing
// glow. No external art file is involved; every shape is code.
export default function AnimatedCharacter({ className = "" }) {
  const bodyRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const glowRef = useRef(null);
  const antennaRef = useRef(null);

  useEffect(() => {
    const floatTween = gsap.to(bodyRef.current, {
      y: -10,
      duration: 2.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const antennaTween = gsap.to(antennaRef.current, {
      rotation: 8,
      transformOrigin: "50% 100%",
      duration: 1.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const glowTween = gsap.to(glowRef.current, {
      opacity: 0.9,
      scale: 1.15,
      transformOrigin: "50% 50%",
      duration: 1.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    let blinkTimeout;
    function scheduleBlink() {
      blinkTimeout = setTimeout(() => {
        gsap.to([leftEyeRef.current, rightEyeRef.current], {
          scaleY: 0.1,
          duration: 0.08,
          yoyo: true,
          repeat: 1,
          transformOrigin: "50% 50%",
        });
        scheduleBlink();
      }, 2000 + Math.random() * 2500);
    }
    scheduleBlink();

    return () => {
      floatTween.kill();
      antennaTween.kill();
      glowTween.kill();
      clearTimeout(blinkTimeout);
    };
  }, []);

  return (
    <svg viewBox="0 0 160 180" className={className} aria-hidden="true">
      <ellipse ref={glowRef} cx="80" cy="150" rx="42" ry="10" fill="#5b6bff" opacity="0.5" />

      <g ref={bodyRef}>
        {/* antenna */}
        <g ref={antennaRef}>
          <line x1="80" y1="18" x2="80" y2="4" stroke="#8b96ff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="4" r="4" fill="#3fe0d0" />
        </g>

        {/* head */}
        <rect x="35" y="20" width="90" height="70" rx="22" fill="#141a2e" stroke="#5b6bff" strokeWidth="2" />

        {/* eyes */}
        <circle ref={leftEyeRef} cx="65" cy="55" r="7" fill="#3fe0d0" />
        <circle ref={rightEyeRef} cx="95" cy="55" r="7" fill="#3fe0d0" />

        {/* body */}
        <rect x="45" y="95" width="70" height="55" rx="18" fill="#11141f" stroke="#5b6bff" strokeWidth="2" />
        <rect x="60" y="112" width="40" height="8" rx="4" fill="#8b96ff" opacity="0.6" />
        <rect x="60" y="126" width="26" height="6" rx="3" fill="#3fe0d0" opacity="0.5" />
      </g>
    </svg>
  );
}
