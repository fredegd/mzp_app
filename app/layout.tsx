import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/layout/navbar"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { UserDataProvider } from "@/lib/context/user-data-context"

const geist = Geist({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Meal Planner App",
  description: "Plan your meals, manage recipes, and create shopping lists",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" }
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ]
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create Supabase client for server component
  const supabase = createServerComponentClient({ cookies })

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {isLoggedIn ? (
            <UserDataProvider>
              <Navbar />
              {children}
            </UserDataProvider>
          ) : (
            children
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
