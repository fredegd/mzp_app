import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import RecipeForm from "@/components/recipes/recipe-form"

export default function NewRecipePage() {
    return (
        <div className="container max-w-4xl mx-auto p-4">
            <RecipeForm />
        </div>
    )
} 