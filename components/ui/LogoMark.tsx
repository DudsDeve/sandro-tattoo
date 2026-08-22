import { cn } from "@/lib/utils";

/** Marca VERSUS — V geométrico. */
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
        d="M18 18 L40 62 L62 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="miter"
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
