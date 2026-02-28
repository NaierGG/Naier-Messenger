"use client";

import { useEffect } from "react";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { TopBar } from "@/components/layout/TopBar";
import { useMessages } from "@/hooks/useMessages";
import { chatStore } from "@/store/chatStore";

interface ChatRoomPageProps {
  params: {
    pubkey: string;
  };
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  const pubkey = params.pubkey;
  const { messages, sendMessage, isLoading } = useMessages(pubkey);

  useEffect(() => {
    if (!pubkey) {
      return;
    }

    chatStore.getState().markAsRead(pubkey);
  }, [pubkey]);

  return (
    <main className="flex min-h-screen flex-1 flex-col">
      <TopBar pubkey={pubkey} />
      <MessageList isLoading={isLoading} messages={messages} />
      <MessageInput disabled={!pubkey} isLoading={isLoading} onSend={sendMessage} />
    </main>
  );
}
