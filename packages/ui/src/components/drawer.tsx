import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@harmony/ui/lib/utils";

function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  showSwipeHandle = false,
  ...props
}: DrawerPrimitive.Popup.Props & {
  showSwipeHandle?: boolean;
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "flex max-h-[calc(100dvh-3rem)] w-full transform-[translateY(var(--drawer-swipe-movement-y))] flex-col rounded-t-xl bg-popover pb-[env(safe-area-inset-bottom)] text-xs/relaxed text-popover-foreground ring-1 ring-foreground/10 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none data-ending-style:transform-[translateY(100%)] data-starting-style:transform-[translateY(100%)] data-swiping:duration-0 data-swiping:select-none",
            className,
          )}
          {...props}
        >
          {showSwipeHandle && (
            <div
              data-slot="drawer-handle"
              className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/40"
            />
          )}
          <DrawerPrimitive.Content className="flex min-h-0 flex-col overflow-y-auto">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

export { Drawer, DrawerContent, DrawerTrigger };
