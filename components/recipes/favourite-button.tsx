"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { toggleRecipeFavourite } from "@/lib/meal-planner" // Make sure this function is implemented in your API lib

interface FavouriteButtonProps {
    recipeId: string
    isFavouriteInitial: boolean
    onToggle?: (isFavourite: boolean) => void
}

// The placeholder async function toggleRecipeFavourite below this comment block has been removed.
// You need to ensure that the imported toggleRecipeFavourite from "@/lib/meal-planner"
// correctly updates the database.
// For example, in @/lib/meal-planner.ts, it might look something like:
//
// export async function toggleRecipeFavourite(recipeId: string, isFavourite: boolean): Promise<void> {
//   const response = await fetch(`/api/recipes/${recipeId}/favourite`, { // Or your actual API endpoint
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ is_favourite: isFavourite }),
//   });
//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.message || "Failed to update favourite status in DB");
//   }
//   // Optionally, return data or handle success further if needed
// }

export default function FavouriteButton({ recipeId, isFavouriteInitial, onToggle }: FavouriteButtonProps) {
    const [isFavourite, setIsFavourite] = useState(isFavouriteInitial)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsFavourite(isFavouriteInitial)
    }, [isFavouriteInitial])

    const handleToggleFavourite = async () => {
        setIsLoading(true)
        try {
            const newFavouriteStatus = !isFavourite
            // This now calls the imported function from @/lib/meal-planner
            await toggleRecipeFavourite(recipeId, newFavouriteStatus)
            setIsFavourite(newFavouriteStatus)
            toast.success(newFavouriteStatus ? "Recipe marked as favourite!" : "Recipe removed from favourites.")
            if (onToggle) {
                onToggle(newFavouriteStatus)
            }
        } catch (error) {
            console.error("Error toggling favourite status:", error)
            // Revert optimistic update if API call fails
            // setIsFavourite(!newFavouriteStatus) // Revert UI state if API call fails - consider if needed
            toast.error(error instanceof Error ? error.message : "Failed to update favourite status.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavourite}
            disabled={isLoading}
            className="rounded-full"
        >
            <Heart
                className={`h-5 w-5 ${isFavourite ? "fill-red-500 text-red-500" : "text-gray-400" // Tailwind classes for fill and stroke
                    }`}
            />
            <span className="sr-only">
                {isFavourite ? "Remove from favourites" : "Mark as favourite"}
            </span>
        </Button>
    )
} 