import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { DateRangeMode } from "@/lib/stores/date-range-store";

import {
  buildDraftRangePreview,
  commitDateRangeDraft,
  parseMonthLabel,
  snapshotDateRangeDraft,
  toIsoDate,
  type DateRangeDraft,
} from "@/lib/date-range";

type DateRangeDraftContextValue = {
  draft: DateRangeDraft;
  draftRange: ReturnType<typeof buildDraftRangePreview>;
  draftCursor: Date;
  draftCustomFrom: Date | null;
  draftCustomTo: Date | null;
  isCustomIncomplete: boolean;
  setMode: (mode: DateRangeMode) => void;
  setCursorMonth: (date: Date) => void;
  setCursorYear: (year: number) => void;
  setCustomFrom: (date: Date) => void;
  setCustomTo: (date: Date) => void;
  selectMonthFromLabel: (label: string) => void;
  commit: () => void;
};

const DateRangeDraftContext = createContext<DateRangeDraftContextValue | null>(null);

type DateRangeDraftProviderProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
};

export function DateRangeDraftProvider({ children, open, onClose }: DateRangeDraftProviderProps) {
  const [draft, setDraft] = useState<DateRangeDraft>(snapshotDateRangeDraft);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (open) {
      setDraft(snapshotDateRangeDraft());
    }
  }, [open]);

  const draftRange = useMemo(() => buildDraftRangePreview(draft), [draft]);
  const draftCursor = useMemo(() => new Date(draft.cursorMs), [draft.cursorMs]);
  const draftCustomFrom = useMemo(
    () => (draft.customFrom ? new Date(draft.customFrom) : null),
    [draft.customFrom],
  );
  const draftCustomTo = useMemo(
    () => (draft.customTo ? new Date(draft.customTo) : null),
    [draft.customTo],
  );
  const isCustomIncomplete = draft.mode === "custom" && (!draft.customFrom || !draft.customTo);

  const setMode = useCallback((mode: DateRangeMode) => {
    setDraft((current) => ({ ...current, mode }));
  }, []);

  const setCursorMonth = useCallback((date: Date) => {
    setDraft((current) => ({
      ...current,
      cursorMs: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
    }));
  }, []);

  const setCursorYear = useCallback((year: number) => {
    setDraft((current) => ({
      ...current,
      cursorMs: new Date(year, 0, 1).getTime(),
    }));
  }, []);

  const setCustomFrom = useCallback((date: Date) => {
    setDraft((current) => ({
      ...current,
      customFrom: toIsoDate(date),
    }));
  }, []);

  const setCustomTo = useCallback((date: Date) => {
    setDraft((current) => ({
      ...current,
      customTo: toIsoDate(date),
    }));
  }, []);

  const selectMonthFromLabel = useCallback((label: string) => {
    const parsed = parseMonthLabel(label);
    if (!parsed) return;
    setDraft((current) => ({
      ...current,
      mode: "month",
      cursorMs: new Date(parsed.year, parsed.month - 1, 1).getTime(),
    }));
  }, []);

  const commit = useCallback(() => {
    commitDateRangeDraft(draftRef.current);
    onClose();
  }, [onClose]);

  const value = useMemo<DateRangeDraftContextValue>(
    () => ({
      draft,
      draftRange,
      draftCursor,
      draftCustomFrom,
      draftCustomTo,
      isCustomIncomplete,
      setMode,
      setCursorMonth,
      setCursorYear,
      setCustomFrom,
      setCustomTo,
      selectMonthFromLabel,
      commit,
    }),
    [
      draft,
      draftRange,
      draftCursor,
      draftCustomFrom,
      draftCustomTo,
      isCustomIncomplete,
      setMode,
      setCursorMonth,
      setCursorYear,
      setCustomFrom,
      setCustomTo,
      selectMonthFromLabel,
      commit,
    ],
  );

  return <DateRangeDraftContext value={value}>{children}</DateRangeDraftContext>;
}

export function useDateRangeDraftContext(): DateRangeDraftContextValue {
  const context = use(DateRangeDraftContext);
  if (!context) {
    throw new Error("useDateRangeDraftContext must be used within DateRangeDraftProvider");
  }
  return context;
}
