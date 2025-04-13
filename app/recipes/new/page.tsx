import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import RecipeForm from "@/components/recipes/recipe-form"

export default function NewRecipePage() {
    return (
        <div className="container max-w-4xl mx-auto p-4">
            <div className="flex items-center mb-6">
                <Link href="/recipes">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Recipes
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold ml-4">Create New Recipe</h1>
            </div>

            <RecipeForm />
        </div>
    )
} 