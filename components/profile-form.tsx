"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [fullName, setFullName] = useState("")
  const [website, setWebsite] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Fetch profile data on component mount
  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)

        const { data, error } = await supabase.from("profiles").select("full_name, website").eq("id", user.id).single()

        if (error) throw error

        if (data) {
          setFullName(data.full_name || "")
          setWebsite(data.website || "")
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [user.id])

  async function updateProfile() {
    try {
      setLoading(true)
      setMessage(null)

      // Update the profile
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        website: website,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Error updating profile. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#1c1c1c] border-gray-800 text-white">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription className="text-gray-400">Update your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`p-4 rounded-md ${message.type === "success"
              ? "bg-green-500/10 border border-green-500/50 text-green-700"
              : "bg-red-500/10 border border-red-500/50 text-red-700"
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">
            Email
          </Label>
          <Input id="email" value={user.email} disabled className="bg-[#252525] border-gray-700 text-gray-400" />
          <p className="text-xs text-gray-500">Your email address cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-300">
            Full Name
          </Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-[#252525] border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-gray-300">
            Website
          </Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="bg-[#252525] border-gray-700 text-white"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
        <Button onClick={updateProfile} disabled={loading} className="bg-[#2b725e] hover:bg-[#235e4c] text-white">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
