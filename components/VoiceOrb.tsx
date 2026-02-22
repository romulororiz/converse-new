'use client';

import { useId, useEffect, useMemo } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationFrame,
} from 'framer-motion';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceOrbProps {
  audioLevel: number; // 0–1, EMA-smoothed by caller
  state: VoiceState;
  size?: number;
}

const PALETTE = {
  idle:       { inner: '#E8A84C', mid: '#B5451B', outer: '#6A2010', glow: 'rgba(181,69,27,0.25)',  ring: 'rgba(181,69,27,0.50)' },
  listening:  { inner: '#F5C060', mid: '#D4621A', outer: '#8B3010', glow: 'rgba(212,98,26,0.42)',  ring: 'rgba(212,98,26,0.72)' },
  processing: { inner: '#D4C0A8', mid: '#A08878', outer: '#6B5848', glow: 'rgba(160,136,120,0.25)', ring: 'rgba(160,136,120,0.42)' },
  speaking:   { inner: '#F8D060', mid: '#C4501B', outer: '#7A2A08', glow: 'rgba(196,80,27,0.45)',  ring: 'rgba(196,80,27,0.75)' },
};

export function VoiceOrb({ audioLevel, state, size = 200 }: VoiceOrbProps) {
  const rawUid = useId();
  // SVG ids must not contain colons or special chars
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, '');

  const pal = PALETTE[state];
  const C = size / 2; // center
  const CORE_R  = size * 0.170; // ~34px at 200
  const OUTER_R = size * 0.380; // ~76px
  const INNER_R = size * 0.280; // ~56px
  const GLOW_RX = size * 0.310;
  const GLOW_RY = size * 0.240;
  const PART_R  = OUTER_R + size * 0.048; // particle orbit radius

  // ── Audio spring chain ──────────────────────────────────────────────────
  const rawAudio = useMotionValue(audioLevel);
  useEffect(() => { rawAudio.set(audioLevel); }, [audioLevel, rawAudio]);
  const springAudio = useSpring(rawAudio, { stiffness: 180, damping: 22, mass: 0.4 });

  const coreScale   = useTransform(springAudio, [0, 1], [1.00, 1.42]);
  const glowOpacity = useTransform(springAudio, [0, 1], [0.30, 0.85]);
  const glowScale   = useTransform(springAudio, [0, 1], [1.00, 1.55]);

  // ── Ring rotation via useAnimationFrame (no React re-renders) ───────────
  const outerRot = useMotionValue(0);
  const innerRot = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    const dt   = Math.min(delta, 64) / 1000; // cap at ~15fps minimum
    const audio = springAudio.get();
    const outerSpeed =
      state === 'listening'  ? 22 + audio * 88 :
      state === 'speaking'   ? 70 :
      state === 'processing' ? 44 :
      12;
    outerRot.set(outerRot.get() + outerSpeed * dt);
    innerRot.set(innerRot.get() - outerSpeed * 1.6 * dt);
  });

  // ── 8 particle angles (stable, never changes) ───────────────────────────
  const particleAngles = useMemo(
    () => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2),
    []
  );

  const toOrigin = `${C}px ${C}px`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      overflow="visible"
      aria-hidden="true"
    >
      <defs>
        {/* Ambient glow blur filter */}
        <filter
          id={`${uid}-blur`}
          x="-120%"
          y="-120%"
          width="340%"
          height="340%"
        >
          <feGaussianBlur stdDeviation={size * 0.09} />
        </filter>

        {/* Core radial gradient */}
        <radialGradient id={`${uid}-core`} cx="35%" cy="35%" r="65%">
          <stop offset="0%"   stopColor={pal.inner} />
          <stop offset="50%"  stopColor={pal.mid}   />
          <stop offset="100%" stopColor={pal.outer}  />
        </radialGradient>

        {/* Specular highlight gradient */}
        <radialGradient id={`${uid}-spec`} cx="28%" cy="24%" r="52%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.48)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </radialGradient>
      </defs>

      {/* ── Layer 0: Ambient glow bloom ── */}
      <motion.ellipse
        cx={C}
        cy={C + size * 0.04}
        rx={GLOW_RX}
        ry={GLOW_RY}
        fill={pal.glow}
        filter={`url(#${uid}-blur)`}
        style={{
          opacity: glowOpacity,
          scale: glowScale,
          transformOrigin: toOrigin,
        }}
      />

      {/* ── Layer 1: Outer rotating ring + 8 orbital particles ── */}
      <motion.g style={{ rotate: outerRot, transformOrigin: toOrigin }}>
        <circle
          cx={C}
          cy={C}
          r={OUTER_R}
          fill="none"
          stroke={pal.ring}
          strokeWidth="1.5"
          strokeDasharray="5 10"
          strokeLinecap="round"
        />
        {particleAngles.map((angle, i) => (
          <circle
            key={i}
            cx={C + Math.cos(angle) * PART_R}
            cy={C + Math.sin(angle) * PART_R}
            r={size * 0.019}
            fill={pal.ring}
            opacity={i % 2 === 0 ? 0.90 : 0.45}
          />
        ))}
      </motion.g>

      {/* ── Layer 2: Inner counter-rotating ring ── */}
      <motion.g style={{ rotate: innerRot, transformOrigin: toOrigin }}>
        <circle
          cx={C}
          cy={C}
          r={INNER_R}
          fill="none"
          stroke={pal.ring}
          strokeWidth="1"
          strokeDasharray="3 18"
          strokeLinecap="round"
          opacity={0.55}
        />
      </motion.g>

      {/* ── Layer 3: Core sphere ── */}
      <motion.circle
        cx={C}
        cy={C}
        r={CORE_R}
        fill={`url(#${uid}-core)`}
        style={{
          scale: coreScale,
          transformOrigin: toOrigin,
          filter: `drop-shadow(0 0 ${size * 0.06}px ${pal.glow})`,
        }}
      />

      {/* ── Layer 4: Specular highlight ── */}
      <circle
        cx={C - CORE_R * 0.22}
        cy={C - CORE_R * 0.30}
        r={CORE_R * 0.50}
        fill={`url(#${uid}-spec)`}
        style={{ pointerEvents: 'none' }}
      />

      {/* ── Processing shimmer sweep ── */}
      {state === 'processing' && (
        <motion.circle
          cx={C}
          cy={C}
          r={CORE_R}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={size * 0.015}
          strokeDasharray={`${CORE_R * 0.85} ${CORE_R * 12}`}
          strokeLinecap="round"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: toOrigin }}
        />
      )}
    </svg>
  );
}
