"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        <Card>
            <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your email and password</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="email" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="email">
                            <Mail className="h-4 w-4 mr-2" />
                            Change Email
                        </TabsTrigger>
                        <TabsTrigger value="password">
                            <Lock className="h-4 w-4 mr-2" />
                            Change Password
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentEmail">Current Email</Label>
                            <Input
                                id="currentEmail"
                                value={user.email}
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newEmail">New Email</Label>
                            <Input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email address"
                            />
                        </div>
                        <Button
                            onClick={handleEmailChange}
                            disabled={emailLoading || !newEmail}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <Button
                            onClick={handlePasswordChange}
                            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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