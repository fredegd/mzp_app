import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SetupMessage from "@/components/setup"

export default async function Home() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return <SetupMessage />
  }

  // Get the user from the server
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is authenticated, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  // If not authenticated, redirect to login
  redirect("/auth/login")
}
