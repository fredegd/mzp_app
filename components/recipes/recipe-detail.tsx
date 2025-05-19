"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Edit, Trash2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Recipe } from "@/types/meal-planner"
import type { Ingredient } from "@/types/meal-planner"
import { deleteRecipe } from "@/lib/meal-planner"
import AddRecipeToMealPlanDialog from './add-recipe-to-meal-plan-dialog'
import FavouriteButton from "./favourite-button"
import { toast } from "sonner"
import { useUserData } from "@/lib/context/user-data-context"

// Local Recipe interface definition for this component
// IMPORTANT: This should ideally be sourced from a central types file (e.g., @/types/meal-planner.ts)
// Ensure that your central Recipe type definition includes 'is_favourite: boolean'.
interface LocalRecipe {
  id: string;
  name: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  image_url?: string;
  // Assuming ingredients can sometimes be a string if not yet parsed, or an array of Ingredient objects
  ingredients: Ingredient[] | string;
  instructions?: string;
  is_favourite: boolean; // This is the new field
}

interface RecipeDetailProps {
  recipe: LocalRecipe // Uses the local Recipe interface defined above
}

export default function RecipeDetail({ recipe: initialRecipe }: RecipeDetailProps) {
  const router = useRouter()
  const { refreshRecipes } = useUserData()
  // State for the recipe details, initialized with the prop
  const [recipe, setRecipe] = useState<LocalRecipe>(initialRecipe)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addToPlanDialogOpen, setAddToPlanDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Effect to update the local recipe state if the initialRecipe prop changes
  useEffect(() => {
    setRecipe(initialRecipe)
  }, [initialRecipe])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteRecipe(recipe.id)
      toast.success('Recipe deleted successfully!')
      router.push("/recipes")
      if (refreshRecipes) await refreshRecipes() // refreshRecipes might be undefined if not provided by context
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast.error("Failed to delete recipe.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleMealAdded = () => {
    toast.success(`'${recipe.name}' added to your meal plan!`)
  }

  // Callback for when the favourite status is toggled by the FavouriteButton
  const handleFavouriteToggle = (isFavourite: boolean) => {
    setRecipe(prevRecipe => ({ ...prevRecipe, is_favourite: isFavourite }))
    // You might want to call refreshRecipes() here if other components need to be updated immediately
    // For example, if a list of all recipes elsewhere filters by favourites.
    // if (refreshRecipes) refreshRecipes();
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl mb-2">{recipe.name}</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => setAddToPlanDialogOpen(true)}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                <span className="hidden md:block">Add to Meal-Plan</span>
              </Button>
              <FavouriteButton
                recipeId={recipe.id}
                isFavouriteInitial={recipe.is_favourite} // This should now correctly reference the is_favourite property
                onToggle={handleFavouriteToggle}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/recipes/${recipe.id}/edit`)} className="flex items-center justify-center">
                <Edit className="h-4 w-4 mr-0 md:mr-2" />
                <span className="hidden md:block">Edit</span>
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="flex items-center justify-center">
                <Trash2 className="h-4 w-4 mr-0 md:mr-2" />
                <span className="hidden md:block">Delete</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-10 flex flex-col gap-10">
          {recipe.image_url && (
            <div className="w-full max-h-[350px] overflow-hidden rounded-md flex items-center justify-center">
              <img
                src={recipe.image_url || "/placeholder.svg"}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            {(recipe.prep_time || recipe.cook_time) && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {recipe.prep_time && recipe.cook_time
                    ? `${recipe.prep_time + recipe.cook_time} min total (${recipe.prep_time} prep + ${recipe.cook_time} cook)`
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

          {recipe.description && (
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-300">{recipe.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-xl font-medium mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1">
              {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ingredient: Ingredient, index: number) => (
                <li key={index}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
          </div>

          <div >
            <h3 className="text-xl font-medium mb-2">Zubereitung</h3>
            <div className=" whitespace-pre-line">{recipe.instructions}</div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="shadow-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Delete Recipe
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Recipe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddRecipeToMealPlanDialog
        open={addToPlanDialogOpen}
        onOpenChange={setAddToPlanDialogOpen}
        recipeId={recipe.id}
        recipeName={recipe.name}
        onMealAdded={handleMealAdded}
      />
    </>
  )
}
