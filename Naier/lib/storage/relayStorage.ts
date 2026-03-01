const RELAYS_STORAGE_KEY = "naier_relays";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadRelayUrls(): string[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RELAYS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function saveRelayUrls(relayUrls: string[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(RELAYS_STORAGE_KEY, JSON.stringify(relayUrls));
}
