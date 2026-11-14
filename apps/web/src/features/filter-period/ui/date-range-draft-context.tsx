import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";

import {
  buildDraftRangePreview,
  commitDateRangeDraft,
  draftFromRange,
  snapshotDateRangeDraft,
  type DateRangeDraft,
} from "@/features/filter-period/lib";

type DateRangeDraftContextValue = {
  draft: DateRangeDraft;
  draftRange: ReturnType<typeof buildDraftRangePreview>;
  isCustomIncomplete: boolean;
  setRange: (from: Date, to: Date) => void;
  commit: () => void;
};

const DateRangeDraftContext = createContext<DateRangeDraftContextValue | null>(null);

type DateRangeDraftProviderProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
};

export const DateRangeDraftProvider = ({
  children,
  open,
  onClose,
}: DateRangeDraftProviderProps) => {
  const [draft, setDraft] = useState<DateRangeDraft>(snapshotDateRangeDraft);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraft(snapshotDateRangeDraft());
    }
  }

  const draftRange = useMemo(() => buildDraftRangePreview(draft), [draft]);
  const isCustomIncomplete = draft.mode === "custom" && (!draft.customFrom || !draft.customTo);

  const setRange = useCallback((from: Date, to: Date) => {
    setDraft((current) => ({ ...current, ...draftFromRange(from, to) }));
  }, []);

  const commit = useCallback(() => {
    commitDateRangeDraft(draft);
    onClose();
  }, [draft, onClose]);

  const value = useMemo(
    () => ({ draft, draftRange, isCustomIncomplete, setRange, commit }),
    [draft, draftRange, isCustomIncomplete, setRange, commit],
  );

  return <DateRangeDraftContext value={value}>{children}</DateRangeDraftContext>;
};

export const useDateRangeDraftContext = () => {
  const context = use(DateRangeDraftContext);
  if (!context) {
    throw new Error("useDateRangeDraftContext must be used within DateRangeDraftProvider");
  }
  return context;
};
