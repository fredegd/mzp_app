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
        <div className="container max-w-4xl mx-auto p-4">
            <div className="flex items-center mb-6">
                <Link href={`/recipes/${params.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Recipe
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold ml-4">Edit Recipe</h1>
            </div>

            <RecipeForm initialRecipe={recipe as Recipe} isEditing />
        </div>
    )
} 