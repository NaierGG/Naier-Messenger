function toDate(unixTimestamp: number): Date {
  const timestamp = unixTimestamp < 1_000_000_000_000 ? unixTimestamp * 1000 : unixTimestamp;
  return new Date(timestamp);
}

export function formatTime(unixTimestamp: number): string {
  const target = toDate(unixTimestamp);
  const now = new Date();
  const time = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(target);

  if (isSameDay(target.getTime(), now.getTime())) {
    return time;
  }

  const date = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit"
  }).format(target);

  return `${date} ${time}`;
}

export function formatDate(unixTimestamp: number): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(toDate(unixTimestamp));
}

export function truncateNpub(npub: string, chars = 8): string {
  if (npub.length <= chars * 2) {
    return npub;
  }

  return `${npub.slice(0, chars)}...${npub.slice(-chars)}`;
}

export function truncatePubkey(pubkey: string, chars = 8): string {
  if (pubkey.length <= chars * 2) {
    return pubkey;
  }

  return `${pubkey.slice(0, chars)}...${pubkey.slice(-chars)}`;
}

export function isSameDay(t1: number, t2: number): boolean {
  const d1 = toDate(t1);
  const d2 = toDate(t2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Backward-compatible wrappers for existing imports in the scaffold.
export function formatRelativeTime(value?: number): string {
  if (!value) {
    return "No activity";
  }

  const target = toDate(value).getTime();
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - target) / 1000));

  if (deltaSeconds < 60) {
    return "Just now";
  }

  if (deltaSeconds < 3600) {
    return `${Math.floor(deltaSeconds / 60)}m ago`;
  }

  if (deltaSeconds < 86400) {
    return `${Math.floor(deltaSeconds / 3600)}h ago`;
  }

  return formatDate(value);
}

export function shortenBech32(value: string, visible = 6): string {
  return truncateNpub(value, visible);
}

export function formatMessagePreview(value?: string): string {
  if (!value) {
    return "No messages yet";
  }

  return value.length > 72 ? `${value.slice(0, 69)}...` : value;
}

export function formatFullDate(value: number): string {
  return formatDate(value);
}

export function isSameCalendarDay(left: number, right: number): boolean {
  return isSameDay(left, right);
}
