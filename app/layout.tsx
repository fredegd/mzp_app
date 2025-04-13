import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/navbar"

const geist = Geist({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Meal Planner App",
  description: "Plan your meals, manage recipes, and create shopping lists",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
