"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContactStore } from "@/store/contactStore";

const navItems = [
  {
    href: "/chat",
    label: "Chats",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    href: "/chat/new",
    label: "New",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    )
  },
  {
    href: "/invite",
    label: "Invite",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M4 12h16" />
        <path d="m12 4 8 8-8 8" />
      </svg>
    )
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1 0 2.8l-.1.1a2 2 0 0 1-2.8 0l-.1-.1a1 1 0 0 0-1.1-.2a1 1 0 0 0-.6.9V20a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.2a1 1 0 0 0-.7-.9a1 1 0 0 0-1 .2l-.2.1a2 2 0 0 1-2.8 0l-.1-.1a2 2 0 0 1 0-2.8l.1-.1a1 1 0 0 0 .2-1.1a1 1 0 0 0-.9-.6H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h.2a1 1 0 0 0 .9-.7a1 1 0 0 0-.2-1l-.1-.2a2 2 0 0 1 0-2.8l.1-.1a2 2 0 0 1 2.8 0l.2.1a1 1 0 0 0 1 .2a1 1 0 0 0 .6-.9V4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.2a1 1 0 0 0 .6.9a1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 0l.1.1a2 2 0 0 1 0 2.8l-.1.2a1 1 0 0 0-.2 1a1 1 0 0 0 .9.7H20a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.2a1 1 0 0 0-.4.2z" />
      </svg>
    )
  }
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const pendingRequestCount = useContactStore(
    (state) => state.contacts.filter((contact) => contact.status === "pending").length
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/chat/new" &&
              item.href !== "/invite" &&
              item.href !== "/settings" &&
              pathname.startsWith(item.href));

          return (
            <Link
              className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
              href={item.href}
              key={item.href}
            >
              <span className="relative inline-flex">
                {item.icon}
                {item.href === "/chat" && pendingRequestCount > 0 ? (
                  <span
                    aria-label={`${pendingRequestCount} pending request${pendingRequestCount === 1 ? "" : "s"}`}
                    className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-zinc-950"
                  >
                    {pendingRequestCount > 9 ? "9+" : pendingRequestCount}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
