"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SecuritySettingsProps {
    user: User
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
    const { toast } = useToast()

    // Email change states
    const [newEmail, setNewEmail] = useState("")
    const [emailLoading, setEmailLoading] = useState(false)

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)

    async function handleEmailChange() {
        if (!newEmail) {
            toast({
                title: "Error",
                description: "Please enter a new email address.",
                variant: "destructive",
            })
            return
        }

        try {
            setEmailLoading(true)

            const { error } = await supabase.auth.updateUser({
                email: newEmail
            })

            if (error) throw error

            toast({
                title: "Success",
                description: "Please check your new email for a confirmation link.",
                variant: "default",
            })

            setNewEmail("")
        } catch (error) {
            console.error("Error updating email:", error)
            toast({
                title: "Error",
                description: "Failed to update email. Please try again.",
                variant: "destructive",
            })
        } finally {
            setEmailLoading(false)
        }
    }

    async function handlePasswordChange() {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                title: "Error",
                description: "Please fill in all password fields.",
                variant: "destructive",
            })
            return
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match.",
                variant: "destructive",
            })
            return
        }

        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long.",
                variant: "destructive",
            })
            return
        }

        try {
            setPasswordLoading(true)

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            toast({
                title: "Success",
                description: "Password updated successfully.",
                variant: "default",
            })

            // Clear the form
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error) {
            console.error("Error updating password:", error)
            toast({
                title: "Error",
                description: "Failed to update password. Please try again.",
                variant: "destructive",
            })
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <Card className="bg-[#1c1c1c] border-gray-800 text-white">
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription className="text-gray-400">Manage your email and password</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="email" className="space-y-4">
                    <TabsList className="bg-[#252525] border-gray-700">
                        <TabsTrigger value="email" className="data-[state=active]:bg-[#2b725e]">
                            <Mail className="h-4 w-4 mr-2" />
                            Change Email
                        </TabsTrigger>
                        <TabsTrigger value="password" className="data-[state=active]:bg-[#2b725e]">
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentEmail" className="text-gray-300">
                                Current Email
                            </Label>
                            <Input
                                id="currentEmail"
                                value={user.email}
                                disabled
                                className="bg-[#252525] border-gray-700 text-gray-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newEmail" className="text-gray-300">
                                New Email
                            </Label>
                            <Input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="bg-[#252525] border-gray-700 text-white"
                                placeholder="Enter new email address"
                            />
                        </div>
                        <Button
                            onClick={handleEmailChange}
                            disabled={emailLoading || !newEmail}
                            className="w-full bg-[#2b725e] hover:bg-[#235e4c] text-white"
                        >
                            {emailLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Email...
                                </>
                            ) : (
                                "Update Email"
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="password" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword" className="text-gray-300">
                                Current Password
                            </Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-[#252525] border-gray-700 text-white"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-gray-300">
                                New Password
                            </Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-[#252525] border-gray-700 text-white"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-300">
                                Confirm New Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-[#252525] border-gray-700 text-white"
                                placeholder="Confirm new password"
                            />
                        </div>
                        <Button
                            onClick={handlePasswordChange}
                            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                            className="w-full bg-[#2b725e] hover:bg-[#235e4c] text-white"
                        >
                            {passwordLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating Password...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
} 