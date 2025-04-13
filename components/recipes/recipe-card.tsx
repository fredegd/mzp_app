import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users } from "lucide-react"
import type { Recipe } from "@/types/meal-planner"

interface RecipeCardProps {
  recipe: Recipe
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="h-full flex flex-col shadow-md hover:border-gray-700 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{recipe.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {recipe.image_url ? (
          <div className="aspect-video w-full mb-4 overflow-hidden rounded-md">
            <img
              src={recipe.image_url || "/placeholder.svg"}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full mb-4 bg-gray-800 rounded-md flex items-center justify-center">
            <span className="text-gray-500">No image</span>
          </div>
        )}
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
      </CardContent>
      <CardFooter>
        <Link href={`/recipes/${recipe.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Recipe
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
