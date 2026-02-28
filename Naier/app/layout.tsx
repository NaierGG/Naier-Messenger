import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AppProviders } from "@/app/providers";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Naier",
  description: "Direct, relay-based messaging on Nostr."
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
