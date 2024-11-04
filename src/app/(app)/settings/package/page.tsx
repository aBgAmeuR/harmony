import { AppHeader } from "@/components/app-header";

export default function SettingsPackagePage() {
  return (
    <>
      <AppHeader items={["Settings", "Package"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
