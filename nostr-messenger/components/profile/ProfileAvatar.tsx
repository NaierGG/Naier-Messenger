"use client";

import { Avatar } from "@/components/common/Avatar";
import { useProfile } from "@/hooks/useProfile";

interface ProfileAvatarProps {
  pubkey: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const avatarSizeClass = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24"
} as const;

const avatarSizeProp = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg"
} as const;

export function ProfileAvatar({
  pubkey,
  size = "md"
}: ProfileAvatarProps) {
  const { profile, isLoading } = useProfile(pubkey);

  if (isLoading) {
    return (
      <div
        className={`animate-pulse rounded-full bg-zinc-800 ${avatarSizeClass[size]}`}
      />
    );
  }

  return (
    <Avatar
      className={size === "xl" ? avatarSizeClass.xl : ""}
      pubkey={pubkey}
      size={avatarSizeProp[size]}
      src={profile?.picture}
    />
  );
}
