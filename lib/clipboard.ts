function copyViaExecCommand(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "2em";
  textarea.style.height = "2em";
  textarea.style.padding = "0";
  textarea.style.border = "none";
  textarea.style.outline = "none";
  textarea.style.boxShadow = "none";
  textarea.style.background = "transparent";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const savedRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);

  if (savedRange && selection) {
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  return copied;
}

/**
 * Copy text to the clipboard with mobile-safe fallbacks.
 * Runs execCommand synchronously first so iOS Safari keeps the user gesture.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (copyViaExecCommand(text)) return true;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export type NativeShareResult = "shared" | "aborted" | "unavailable" | "failed";

function buildShareCandidates(data: {
  url: string;
  title?: string;
  text?: string;
}): ShareData[] {
  const { url } = data;
  const title = data.title?.trim();
  const text = data.text?.trim();
  const candidates: ShareData[] = [{ url }];

  if (title) candidates.push({ url, title });
  if (text) candidates.push({ url, text });
  if (title && text) candidates.push({ url, title, text });

  return candidates;
}

function pickSharePayload(candidates: ShareData[]): ShareData | undefined {
  if (candidates.length === 0) return undefined;

  if (typeof navigator.canShare === "function") {
    for (let i = candidates.length - 1; i >= 0; i -= 1) {
      if (navigator.canShare(candidates[i])) return candidates[i];
    }
    return undefined;
  }

  // Without canShare (common on older mobile Safari), url-only is most reliable.
  return candidates[0];
}

/**
 * Open the native share sheet when available. Must be invoked synchronously
 * from a user gesture (e.g. click handler) so mobile Safari keeps the gesture.
 */
export function shareViaNavigator(data: {
  url: string;
  title?: string;
  text?: string;
}): Promise<NativeShareResult> {
  if (!("share" in navigator) || typeof navigator.share !== "function") {
    return Promise.resolve("unavailable");
  }

  const shareData = pickSharePayload(buildShareCandidates(data));
  if (!shareData) {
    return Promise.resolve("failed");
  }

  return navigator
    .share(shareData)
    .then(() => "shared" as const)
    .catch((err: unknown) => {
      if ((err as Error).name === "AbortError") return "aborted" as const;
      return "failed" as const;
    });
}
