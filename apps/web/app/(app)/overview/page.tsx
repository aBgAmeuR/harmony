import { AppHeader } from "~/components/app-header";

export default function OverviewPage() {
  return (
    <>
      <AppHeader items={["Package", "Overview"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0"></div>
    </>
  );
}
