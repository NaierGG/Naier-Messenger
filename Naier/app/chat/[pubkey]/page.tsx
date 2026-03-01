"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DmRelayNotice } from "@/components/chat/DmRelayNotice";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { TopBar } from "@/components/layout/TopBar";
import { useMessages } from "@/hooks/useMessages";
import { useToast } from "@/hooks/useToast";
import { chatStore } from "@/store/chatStore";
import { useContactStore } from "@/store/contactStore";

interface ChatRoomPageProps {
  params: {
    pubkey: string;
  };
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  const router = useRouter();
  const pubkey = params.pubkey;
  const contact = useContactStore((state) => state.getContact(pubkey));
  const acceptContact = useContactStore((state) => state.acceptContact);
  const dismissContact = useContactStore((state) => state.dismissContact);
  const blockContact = useContactStore((state) => state.blockContact);
  const unblockContact = useContactStore((state) => state.unblockContact);
  const isPendingRequest = contact?.status === "pending";
  const isBlocked = contact?.status === "blocked";
  const { info, warning } = useToast();
  const { messages, sendMessage, retryMessage, resyncMessages, isLoading, isResyncing } =
    useMessages(pubkey);

  useEffect(() => {
    if (!pubkey) {
      return;
    }

    chatStore.getState().markAsRead(pubkey);
  }, [pubkey]);

  return (
    <main className="flex min-h-screen flex-1 flex-col">
      <TopBar isResyncing={isResyncing} onResync={() => void resyncMessages(24)} pubkey={pubkey} />
      <DmRelayNotice recipientPubkey={pubkey} />
      {isPendingRequest ? (
        <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl">
              This contact is in your message requests. Accept before replying so the conversation
              moves into your main inbox.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
                onClick={() => {
                  dismissContact(pubkey);
                  info("Request dismissed.");
                  router.push("/chat");
                }}
                type="button"
              >
                Reject
              </button>
              <button
                className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-100 transition hover:border-red-500/50 hover:bg-red-500/20"
                onClick={() => {
                  blockContact(pubkey);
                  warning("Contact blocked on this device.");
                  router.push("/chat");
                }}
                type="button"
              >
                Block
              </button>
              <button
                className="rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-500"
                onClick={() => acceptContact(pubkey)}
                type="button"
              >
                Accept Request
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {isBlocked ? (
        <div className="border-b border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              This contact is blocked on this device. Incoming messages from this pubkey are
              ignored until you unblock them.
            </p>
            <button
              className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
              onClick={() => {
                unblockContact(pubkey);
                info("Contact unblocked.");
              }}
              type="button"
            >
              Unblock
            </button>
          </div>
        </div>
      ) : null}
      <MessageList isLoading={isLoading} messages={messages} onRetry={retryMessage} />
      <MessageInput
        disabled={!pubkey || isPendingRequest || isBlocked}
        disabledReason={
          isPendingRequest
            ? "Accept this request before sending a reply."
            : isBlocked
              ? "This contact is blocked on this device."
              : undefined
        }
        isLoading={isLoading}
        onSend={sendMessage}
      />
    </main>
  );
}
