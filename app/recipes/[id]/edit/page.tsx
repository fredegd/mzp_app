import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import RecipeForm from "@/components/recipes/recipe-form"
import type { Recipe } from "@/types/meal-planner"

interface EditRecipePageProps {
    params: {
        id: string
    }
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
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
        <div className="container max-w-4xl mx-auto p-4 mb-16">


            <RecipeForm initialRecipe={recipe as Recipe} isEditing />
        </div>
    )
} 