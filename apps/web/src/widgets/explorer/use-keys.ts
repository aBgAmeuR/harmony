import { useEffect, useEffectEvent } from "react";

type KeysArgs = {
  count: number;
  active: number;
  onActive: (index: number) => void;
  onOpen: (index: number) => void;
  onSearch: () => void;
  onEscape: () => void;
};

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

// j/k and the arrows move through the rows, Enter opens one, `/` jumps to the search.
// `a` is handled by the artist menu itself. Nothing fires while typing or while a dialog is open.
export const useExplorerKeys = (args: KeysArgs) => {
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const { count, active, onActive, onOpen, onSearch, onEscape } = args;

    if (event.key === "Escape") {
      if (isTyping(event.target) && event.target instanceof HTMLElement) event.target.blur();
      else onEscape();
      return;
    }

    if (isTyping(event.target) || document.querySelector("[role=dialog], [role=listbox]")) return;

    if (event.key === "/") {
      event.preventDefault();
      onSearch();
    } else if (event.key === "j" || event.key === "ArrowDown") {
      event.preventDefault();
      onActive(Math.min(active + 1, count - 1));
    } else if (event.key === "k" || event.key === "ArrowUp") {
      event.preventDefault();
      onActive(Math.max(active - 1, 0));
    } else if (event.key === "Enter" && active >= 0 && active < count) {
      event.preventDefault();
      onOpen(active);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
};
