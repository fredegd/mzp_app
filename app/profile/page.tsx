import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import ProfileForm from "@/components/profile-form"
import SecuritySettings from "@/components/security-settings"
import { signOut } from "@/lib/actions"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Redirect if user is not logged in
    if (!user) {
        redirect("/")
    }

    return (
        <div className="container max-w-3xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <div className="grid grid-cols-1 gap-6">
                <ProfileForm user={user} />
                <SecuritySettings user={user} />

                <Card className="bg-[#1c1c1c] border-gray-800 text-white">
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                        <CardDescription className="text-gray-400">
                            Manage your account status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={signOut}>
                            <Button type="submit" variant="destructive" className="flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start border-t border-gray-800 pt-6">
                        <p className="text-sm text-gray-400 mb-2">Account email: {user.email}</p>
                        <p className="text-sm text-gray-400">Account created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
} 