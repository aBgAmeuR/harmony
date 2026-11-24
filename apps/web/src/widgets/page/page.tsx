import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@harmony/ui/components/resizable";
import { Sheet, SheetContent } from "@harmony/ui/components/sheet";
import { SidebarTrigger } from "@harmony/ui/components/sidebar";
import { useIsMobile } from "@harmony/ui/hooks/use-mobile";
import { cn } from "@harmony/ui/lib/utils";
import { useState, type ReactNode } from "react";

import { detailWidth, formatTrail, useDetail } from "@/features/detail-panel";
import { DateRangeFilter } from "@/features/filter-period";
import { Pane } from "@/shared/primitives/pane";
import { Toolbar } from "@/shared/primitives/toolbar";
import { DetailPanel } from "@/widgets/details/panel";

type PageProps = {
  title: ReactNode;
  width?: "column" | "wide" | "full";
  fill?: boolean;
  className?: string;
  children: ReactNode;
};

export const Page = ({ title, width = "column", fill, className, children }: PageProps) => {
  const { trail, close } = useDetail();
  const mobile = useIsMobile();
  const open = trail.length > 0;
  const [last, setLast] = useState(trail);
  const [wasOpen, setWasOpen] = useState(open);
  const [closing, setClosing] = useState(false);
  if (open && formatTrail(trail) !== formatTrail(last)) setLast(trail);
  if (open !== wasOpen) {
    setWasOpen(open);
    setClosing(!open);
  }

  return (
    <Pane>
      <ResizablePanelGroup className="min-h-0 flex-1">
        <ResizablePanel id="page" minSize="30%">
          <Pane.Surface>
            <Pane.Header>
              <SidebarTrigger className="-ml-2 md:hidden" />
              {typeof title === "string" ? <Pane.Title>{title}</Pane.Title> : title}
              <Toolbar.End>
                <DateRangeFilter />
              </Toolbar.End>
            </Pane.Header>
            {fill ? (
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            ) : (
              <Pane.Body width={width} className={className}>
                {children}
              </Pane.Body>
            )}
          </Pane.Surface>
        </ResizablePanel>
        {(open || closing) && !mobile ? (
          <>
            <ResizableHandle className="w-1 bg-transparent hover:bg-transparent" />
            <ResizablePanel
              id="detail"
              defaultSize={detailWidth.read()}
              minSize={320}
              maxSize="60%"
              onResize={({ inPixels }) => detailWidth.save(inPixels)}
            >
              <div
                className={cn(
                  "h-full duration-200",
                  open
                    ? "animate-in fade-in slide-in-from-right-8"
                    : "animate-out fill-mode-forwards fade-out slide-out-to-right-8",
                )}
                onAnimationEnd={(event) =>
                  event.target === event.currentTarget && setClosing(false)
                }
              >
                <Pane.Surface>
                  <DetailPanel item={last.at(-1)} />
                </Pane.Surface>
              </div>
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
      <Sheet open={open && mobile} onOpenChange={(next) => !next && close()}>
        <SheetContent showCloseButton={false}>
          <DetailPanel />
        </SheetContent>
      </Sheet>
    </Pane>
  );
};
