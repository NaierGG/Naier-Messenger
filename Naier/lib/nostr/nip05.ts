export async function verifyNip05(
  nip05: string,
  pubkey: string
): Promise<boolean> {
  const trimmed = nip05.trim();
  const match = trimmed.match(/^([^@\s]+)@([^@\s]+\.[^@\s]+)$/);

  if (!match) {
    return false;
  }

  const [, user, domain] = match;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(
      `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(user)}`,
      {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as {
      names?: Record<string, string>;
    };

    return data.names?.[user] === pubkey;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
