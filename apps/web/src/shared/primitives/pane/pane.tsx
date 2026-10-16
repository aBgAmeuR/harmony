import {
  Children,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";

import { Actions, Header, Sep, Title } from "./header";
import { Resizable, type FrameProps } from "./resizable";
import { Scroll } from "./scroll";

type RootProps = PropsWithChildren<{
  layoutId?: string;
}>;

const Frame = ({ children }: FrameProps) => children;

const isFrame = (child: ReactNode): child is ReactElement<FrameProps> =>
  isValidElement(child) && child.type === Frame;

const Root = ({ children, layoutId }: RootProps) => {
  const frames = Children.toArray(children).filter(isFrame);

  if (frames.length === 0) {
    return <div>{children}</div>;
  }

  return <Resizable layoutId={layoutId ?? "harmony:pane-layout:v1"} frames={frames} />;
};

export const Pane = Object.assign(Root, { Frame, Header, Title, Sep, Actions, Scroll });
