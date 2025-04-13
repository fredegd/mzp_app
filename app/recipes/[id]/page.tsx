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
            <div className="flex justify-between items-center mb-6">
                <Link href="/recipes">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Recipes
                    </Button>
                </Link>
                <Link href={`/recipes/${params.id}/edit`}>
                    <Button size="sm" className="gap-2 bg-[#2b725e] hover:bg-[#235e4c] text-white">
                        <Pencil className="h-4 w-4" />
                        Edit Recipe
                    </Button>
                </Link>
            </div>

            <RecipeDetail recipe={recipe as Recipe} />
        </div>
    )
} 