"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { useNostrSubscribe } from "@/hooks/useNostrSubscribe";
import { relayStore } from "@/store/relayStore";

export default function ChatLayout({ children }: PropsWithChildren) {
  useNostrSubscribe();

  useEffect(() => {
    relayStore.getState().initRelays();
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar className="hidden md:flex md:w-80" />
      <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">{children}</div>
      <MobileNav />
    </div>
  );
}
