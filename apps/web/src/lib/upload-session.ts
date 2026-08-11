export type UploadSession = {
  publicId: string;
  packageFileName: string;
  selectedFiles: string[];
  deploySelection: string[];
};

const STORAGE_KEY = "harmony:upload-session:v1";

export function loadUploadSession(): UploadSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;

    const session = parsed as Partial<UploadSession>;
    if (
      typeof session.publicId !== "string" ||
      typeof session.packageFileName !== "string" ||
      !Array.isArray(session.selectedFiles) ||
      !Array.isArray(session.deploySelection)
    ) {
      return null;
    }

    return {
      publicId: session.publicId,
      packageFileName: session.packageFileName,
      selectedFiles: session.selectedFiles.filter(
        (path): path is string => typeof path === "string",
      ),
      deploySelection: session.deploySelection.filter(
        (path): path is string => typeof path === "string",
      ),
    };
  } catch {
    return null;
  }
}

export function saveUploadSession(session: UploadSession): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Quota exceeded or storage disabled.
  }
}

export function clearUploadSession(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

let pendingClearTimer: ReturnType<typeof setTimeout> | null = null;

/** Schedule clear after leave; cancelled if Provider remounts (Strict Mode / soft nav). */
export function scheduleSessionClear(delayMs = 100): void {
  cancelPendingSessionClear();
  pendingClearTimer = setTimeout(() => {
    pendingClearTimer = null;
    clearUploadSession();
  }, delayMs);
}

export function cancelPendingSessionClear(): void {
  if (pendingClearTimer === null) return;
  clearTimeout(pendingClearTimer);
  pendingClearTimer = null;
}
