import React from "react";
import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export const PackageHistoryUpload = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return null;
  }

  const packages = await prisma.package.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!packages) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl">Your Spotify Data Packages</CardTitle>
        <p className="text-muted-foreground">
          History of your uploaded Spotify data packages
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between p-4 rounded-lg border gap-2"
            >
              <div>
                <p className="font-medium break-all line-clamp-1">
                  Package ID: {pkg.id}
                </p>
                <p className="text-sm text-muted-foreground">
                  Uploaded on {pkg.createdAt.toLocaleDateString()}
                </p>
              </div>
              <p className="text-sm text-muted-foreground break-all line-clamp-1">
                {pkg.spotify_id}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
