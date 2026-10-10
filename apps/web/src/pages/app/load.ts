import { queryClient } from "@/app/query-client";
import { openFn } from "@/data/packages/open";

let loadedPackageId: string | null = null;

export const loadApp = async (packageId: string) => {
  await openFn(packageId);

  // Query keys are not scoped by package
  if (loadedPackageId !== null && loadedPackageId !== packageId) queryClient.clear();
  loadedPackageId = packageId;
};
