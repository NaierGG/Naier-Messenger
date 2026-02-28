"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]"
} as const;

export function LoadingSpinner({
  size = "md",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <span
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-zinc-700 border-t-emerald-400 ${sizeMap[size]} ${className}`.trim()}
      role="status"
    />
  );
}
