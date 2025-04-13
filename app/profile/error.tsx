"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function ProfileError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="container max-w-3xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>
            <div className="p-6 bg-red-500/10 border border-red-500 rounded-lg text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-gray-400 mb-6">{error.message || "An error occurred while loading your profile."}</p>
                <Button onClick={() => reset()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </Button>
            </div>
        </div>
    )
} 