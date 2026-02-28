"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";

function isNearBottom(element: HTMLDivElement): boolean {
  const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
  return distance <= 50;
}

export function useScrollBottom(dependency: unknown[]): {
  scrollRef: React.RefObject<HTMLDivElement>;
  scrollToBottom: () => void;
  isAtBottom: boolean;
} {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  function scrollToBottom(): void {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth"
    });
  }

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      setIsAtBottom(isNearBottom(element));
    };

    handleScroll();
    element.addEventListener("scroll", handleScroll);

    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [isAtBottom, ...dependency]);

  return {
    scrollRef,
    scrollToBottom,
    isAtBottom
  };
}
