interface LampGlowProps {
  className?: string;
  size?: number;
  opacity?: number;
  color?: string;
}

export function LampGlow({
  className = '',
  size = 500,
  opacity = 1,
  color = 'rgba(201,168,76,0.18)',
}: LampGlowProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
      }}
    />
  );
}
