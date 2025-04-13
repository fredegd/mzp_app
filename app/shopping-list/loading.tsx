import { Loader2 } from "lucide-react"

export default function ShoppingListLoading() {
    return (
        <div className="container max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Shopping List</h1>
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        </div>
    )
} 