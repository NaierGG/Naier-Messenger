"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CopyButton } from "@/components/common/CopyButton";
import { generateKeyPair, nsecToKeyPair } from "@/lib/nostr/keys";
import { saveKeys } from "@/lib/storage/keyStorage";
import { isValidNsec } from "@/lib/utils/validation";
import type { NostrKeyPair } from "@/types/nostr";
import { authStore } from "@/store/authStore";

type TabKey = "generate" | "login";

function TabButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-emerald-500 text-zinc-950"
          : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export function KeySetup() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("generate");
  const [generatedKeyPair, setGeneratedKeyPair] = useState<NostrKeyPair | null>(null);
  const [nsec, setNsec] = useState("");
  const [showNsec, setShowNsec] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isValid = useMemo(() => (nsec ? isValidNsec(nsec) : false), [nsec]);

  function handleGenerate(): void {
    const keyPair = generateKeyPair();
    saveKeys(keyPair);
    authStore.getState().setKeys(keyPair);
    setGeneratedKeyPair(keyPair);
    setErrorMessage("");
  }

  function handleStartChat(): void {
    if (!generatedKeyPair) {
      return;
    }

    router.push("/chat");
  }

  function handleLogin(): void {
    try {
      const keyPair = nsecToKeyPair(nsec);
      saveKeys(keyPair);
      authStore.getState().setKeys(keyPair);
      setErrorMessage("");
      router.push("/chat");
    } catch {
      setErrorMessage("Please enter a valid nsec key.");
    }
  }

  return (
    <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-6 text-zinc-100 shadow-2xl">
      <div className="flex flex-wrap gap-2">
        <TabButton active={activeTab === "generate"} onClick={() => setActiveTab("generate")}>
          Generate Key
        </TabButton>
        <TabButton active={activeTab === "login"} onClick={() => setActiveTab("login")}>
          Login With Key
        </TabButton>
      </div>

      {activeTab === "generate" ? (
        <div className="mt-6 space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Generate a new Nostr key</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Create a local keypair and back up your `nsec` before continuing.
            </p>
          </div>

          <button
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
            onClick={handleGenerate}
            type="button"
          >
            Generate New Key
          </button>

          {generatedKeyPair ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Generated npub
                  </p>
                  <p className="mt-1 truncate font-mono text-sm text-zinc-200">
                    {generatedKeyPair.npub}
                  </p>
                </div>
                <CopyButton label="Copy" text={generatedKeyPair.npub} />
              </div>

              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                `nsec` is your private backup. Store it safely before entering chat.
              </div>

              <button
                className="mt-4 rounded-full border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-100 transition hover:border-zinc-500"
                onClick={handleStartChat}
                type="button"
              >
                Start Chat
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Login with existing nsec</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Paste your `nsec` to restore this account in the current browser.
            </p>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-zinc-200">nsec</span>
            <div className="flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
                onChange={(event) => {
                  setNsec(event.target.value);
                  setErrorMessage("");
                }}
                placeholder="nsec1..."
                type={showNsec ? "text" : "password"}
                value={nsec}
              />
              <button
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300"
                onClick={() => setShowNsec((current) => !current)}
                type="button"
              >
                {showNsec ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="flex items-center gap-2 text-sm">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                nsec ? (isValid ? "bg-emerald-400" : "bg-red-400") : "bg-zinc-700"
              }`}
            />
            <span className={isValid ? "text-emerald-300" : "text-zinc-400"}>
              {nsec
                ? isValid
                  ? "Valid nsec format"
                  : "Invalid nsec format"
                : "Enter an nsec to validate"}
            </span>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          ) : null}

          <button
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isValid}
            onClick={handleLogin}
            type="button"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
