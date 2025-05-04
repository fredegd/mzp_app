import type React from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SetupMessage from "@/components/setup"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return <SetupMessage />
  }

  // Check if user is already logged in
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#161616] px-4 py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
