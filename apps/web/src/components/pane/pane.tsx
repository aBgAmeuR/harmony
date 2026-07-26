import {
  Children,
  isValidElement,
  PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";

import { PaneHeader } from "./header";
import { PaneFrameProps, PaneResizable } from "./pane-resizable";
import { PaneScrollArea } from "./scroll-area";

type PaneRootProps = PropsWithChildren<{
  layoutId?: string;
}>;

function isPaneFrame(child: ReactNode): child is ReactElement<PaneFrameProps> {
  return isValidElement(child) && child.type === PaneFrame;
}

function PaneRoot({ children, layoutId }: PaneRootProps) {
  const frames = Children.toArray(children).filter(isPaneFrame);

  if (frames.length === 0) {
    return <div>{children}</div>;
  }

  return <PaneResizable layoutId={layoutId ?? "harmony:pane-layout:v1"} frames={frames} />;
}

function PaneFrame({ children }: PaneFrameProps) {
  return children;
}

export const Pane = Object.assign(PaneRoot, {
  Frame: PaneFrame,
  Header: PaneHeader,
  ScrollArea: PaneScrollArea,
});
