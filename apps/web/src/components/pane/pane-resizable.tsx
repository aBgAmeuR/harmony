import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDefaultLayout,
} from "@harmony/ui/components/resizable";
import { PropsWithChildren, ReactElement } from "react";
import { Fragment } from "react/jsx-runtime";

type PaneFrameSize = {
  default?: number;
  min?: number;
  max?: number;
};

export type PaneFrameProps = PropsWithChildren<{
  id: string;
  show?: boolean;
  size?: PaneFrameSize;
}>;

export function PaneResizable({
  layoutId,
  frames,
}: {
  layoutId: string;
  frames: ReactElement<PaneFrameProps>[];
}) {
  const visible = frames.filter((frame) => frame.props.show !== false);
  const panelIds = visible.map((frame) => frame.props.id);

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: layoutId,
    panelIds,
    storage: localStorage,
  });

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <ResizablePanelGroup
        className="min-h-0 flex-1"
        orientation="horizontal"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        {visible.map((frame, index) => (
          <Fragment key={frame.props.id}>
            {index > 0 && <ResizableHandle />}
            <ResizablePanel
              id={frame.props.id}
              className="flex h-full min-h-0 flex-col"
              style={{ overflow: "hidden" }} // className cannot override it
              defaultSize={frame.props.size?.default}
              minSize={frame.props.size?.min}
              maxSize={frame.props.size?.max}
            >
              {frame.props.children}
            </ResizablePanel>
          </Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}
