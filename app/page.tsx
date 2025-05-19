import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {

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
