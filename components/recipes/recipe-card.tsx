"use client" // Add this directive to make it a Client Component

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users } from "lucide-react"
import FavouriteButton from "./favourite-button"
import type { Recipe } from "@/types/meal-planner"; // Import global Recipe type

// REMOVE LOCAL RECIPE DEFINITION
// interface Recipe {
//   id: string;
//   name: string;
//   description?: string;
//   prep_time?: number;
//   cook_time?: number;
//   servings?: number;
//   image_url?: string;
//   // ingredients: any[]; // Or your specific Ingredient type
//   // instructions?: string;
//   is_favourite: boolean; // Added new property
// }

interface RecipeCardProps {
  recipe: Recipe, // Now uses the imported global Recipe type
  viewMode?: "grid" | "list"
}

export default function RecipeCard({ recipe, viewMode = "grid" }: RecipeCardProps) {
  const isListMode = viewMode === "list"

  // This function would ideally be passed down or handled via context/state management
  // For now, it's a local handler to update the UI visually if needed.
  const handleFavouriteToggleInCard = (isFavourite: boolean) => {
    // In a real app, you might want to update a local state or trigger a refresh
    // of the list that contains these cards if the card itself cannot re-render
    // based on a global state change. For this example, we assume the FavouriteButton
    // handles its own state and the visual update is sufficient within the button itself.
    console.log(`Favourite status changed in card for recipe ${recipe.id} to: ${isFavourite}`);
    // If using a global state (like Zustand, Redux, or React Context with useReducer):
    // updateRecipeInGlobalStore(recipe.id, { is_favourite: isFavourite });
  };

  const recipeImage = recipe.image_url ? (
    <div className={`${isListMode ? "md:w-1/6 w-1/3  h-full bg-cover  " : "aspect-video w-full mb-4"} overflow-hidden rounded-md`}>
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
      <div className="flex justify-between items-center text-sm text-gray-400">
        <div className="flex items-center">
          {(recipe.prep_time || recipe.cook_time) && (
            <div className="flex items-center mr-3">
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
        <FavouriteButton
          recipeId={recipe.id}
          isFavouriteInitial={recipe.is_favourite}
          onToggle={handleFavouriteToggleInCard}
        />
      </div>
    </>
  )

  // List-Mode (horizontal)
  if (isListMode) {
    return (
      <Link href={`/recipes/${recipe.id}`} className="w-full">
        <Card className="md:h-32 h-24 flex flex-row shadow-md hover:border-gray-700 transition-colors">
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
          <CardTitle className="line-clamp-1 mb-4">{recipe.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {recipeImage}
          {recipeDetails}
        </CardContent>
      </Card>
    </Link>
  )
}
