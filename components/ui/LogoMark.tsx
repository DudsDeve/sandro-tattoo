import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  compact = false,
  animate = false,
}: {
  className?: string;
  compact?: boolean;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={cn("overflow-visible", className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M18 58 V22 H40 C52 22 58 30 58 40 C58 50 52 58 40 58 H18 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        pathLength={1}
        className={animate ? "origin-center" : undefined}
        style={
          animate
            ? {
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: "draw-stroke 1.6s ease forwards",
              }
            : undefined
        }
        fill={compact ? "currentColor" : "none"}
        fillOpacity={compact ? 0.08 : 0}
      />
      <path
        d="M28 48 V32 H38 C44 32 47 35 47 40 C47 45 44 48 38 48 H28"
        stroke="currentColor"
        strokeWidth="2.2"
        pathLength={1}
        style={
          animate
            ? {
                strokeDasharray: 1,
                strokeDashoffset: 1,
                animation: "draw-stroke 1.4s 0.25s ease forwards",
              }
            : undefined
        }
      />
      {!compact && (
        <path
          d="M14 66 H66"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity={0.5}
          pathLength={1}
          style={
            animate
              ? {
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: "draw-stroke 0.8s 0.9s ease forwards",
                }
              : undefined
          }
        />
      )}
    </svg>
  );
}
