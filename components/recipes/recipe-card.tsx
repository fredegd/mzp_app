import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users } from "lucide-react"
import type { Recipe } from "@/types/meal-planner"

interface RecipeCardProps {
  recipe: Recipe,
  viewMode?: "grid" | "list"
}

export default function RecipeCard({ recipe, viewMode = "grid" }: RecipeCardProps) {
  const isListMode = viewMode === "list"

  // Gemeinsame Inhalte für beide Modi
  const recipeImage = recipe.image_url ? (
    <div className={`${isListMode ? "w-1/6 h-full bg-cover  " : "aspect-video w-full mb-4"} overflow-hidden rounded-md`}>
      <img
        src={recipe.image_url || "/placeholder.svg"}
        alt={recipe.name}
        className="w-full h-full object-cover"
      />
    </div>
  ) : (
    <div className={`${isListMode ? "w-1/4 h-full" : "aspect-video w-full mb-4"} bg-gray-800 rounded-md flex items-center justify-center`}>
      <span className="text-gray-500">No image</span>
    </div>
  )

  const recipeDetails = (
    <>
      <p className="text-gray-400 text-sm line-clamp-2 mb-4">{recipe.description || "No description available."}</p>
      <div className="flex justify-between text-sm text-gray-400">
        {(recipe.prep_time || recipe.cook_time) && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {recipe.prep_time && recipe.cook_time
                ? `${recipe.prep_time + recipe.cook_time} min`
                : recipe.prep_time
                  ? `${recipe.prep_time} min prep`
                  : `${recipe.cook_time} min cook`}
            </span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        )}
      </div>
    </>
  )

  // List-Mode (horizontal)
  if (isListMode) {
    return (
      <Link href={`/recipes/${recipe.id}`} className="w-full">
        <Card className="h-32 flex flex-row shadow-md hover:border-gray-700 transition-colors">
          {recipeImage}
          <div className="flex flex-col flex-1 p-4">
            <CardTitle className="line-clamp-1 mb-2">{recipe.name}</CardTitle>
            <div className="flex-1">
              {recipeDetails}
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Grid-Mode (original vertical layout)
  return (
    <Link href={`/recipes/${recipe.id}`} className="w-full">
      <Card className="h-full flex flex-col shadow-md hover:border-gray-700 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1">{recipe.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {recipeImage}
          {recipeDetails}
        </CardContent>
      </Card>
    </Link>
  )
}
