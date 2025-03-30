"use client"
import { isDemo } from "@/utils/supabase"

export function DemoBanner() {
  if (!isDemo) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-4 py-2 text-center text-sm">
      Demo Mode: Connect to Supabase integration to get started
    </div>
  )
}

