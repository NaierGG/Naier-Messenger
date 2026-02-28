"use client";

import { useMemo, useState } from "react";

interface AvatarProps {
  src?: string;
  pubkey: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16"
} as const;

export function Avatar({
  src,
  pubkey,
  size = "md",
  className = ""
}: AvatarProps) {
  const fallbackSrc = useMemo(
    () => `https://robohash.org/${encodeURIComponent(pubkey)}?set=set4`,
    [pubkey]
  );
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  return (
    <div
      className={`overflow-hidden rounded-full bg-zinc-800 ${sizeMap[size]} ${className}`.trim()}
    >
      <img
        alt={pubkey}
        className="h-full w-full object-cover"
        onError={() => {
          if (currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
          }
        }}
        src={currentSrc}
      />
    </div>
  );
}
