import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil } from "lucide-react"
import RecipeDetail from "@/components/recipes/recipe-detail"
import type { Recipe } from "@/types/meal-planner"

interface RecipePageProps {
    params: {
        id: string
    }
}

export default async function RecipePage({ params }: RecipePageProps) {
    const supabase = createClient()

    // Get the recipe
    const { data: recipe, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", params.id)
        .single()

    if (error || !recipe) {
        notFound()
    }

    return (
        <div className="container max-w-4xl mx-auto p-4">

            <RecipeDetail recipe={recipe as Recipe} />
        </div>
    )
} 