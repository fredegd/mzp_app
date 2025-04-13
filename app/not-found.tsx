import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-gray-400 text-center mb-8 max-w-md">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link href="/dashboard">
                <Button className="gap-2 bg-[#2b725e] hover:bg-[#235e4c] text-white">
                    <Home className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </Link>
        </div>
    )
} 