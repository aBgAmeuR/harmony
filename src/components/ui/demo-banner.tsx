'use client';

import { getUserInfo } from "@/lib/store";
import { Button } from "@mantine/core";
import Link from "next/link";

const DemoBanner = () => {
  const user = getUserInfo()
  if (!user || user.id !== "demo") return null

  return (
    <div className="h-10 w-full">
      <Link href="/" className="size-full">
        <Button className="size-full">Quitter la démo et commencer !</Button>
      </Link>
    </div>
  )
}

export default DemoBanner;
