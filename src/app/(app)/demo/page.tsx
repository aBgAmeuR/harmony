'use client';

import { storeData } from "@/lib/store"
import { DataResults } from "@/types";
import { LoadingOverlay } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useTransition, useEffect } from "react";

export default function Page() {
  const [transition, startTransition] = useTransition()
  const router = useRouter()

  const getDemoData = () => {
    try {
      startTransition(async () => {
        const response = await fetch("/api/demo")
        const data = await response.json() as DataResults
        storeData(data)

        router.push("/overview")
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    getDemoData()
  }, [])

  return (
    <div className="size-full flex items-center justify-center">
      <LoadingOverlay visible />
    </div>
  )
}


