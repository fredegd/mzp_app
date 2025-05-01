"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, ChevronLeft, Edit, Trash2, AlertCircle } from "lucide-react"
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
import { toast } from "sonner"

interface RecipeDetailProps {
  recipe: Recipe
}

export default function RecipeDetail({ recipe }: RecipeDetailProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addToPlanDialogOpen, setAddToPlanDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteRecipe(recipe.id)
      toast.success('Recipe deleted successfully!')
      router.push("/recipes")
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

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/recipes">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
        </Link>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddToPlanDialogOpen(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Add to Meal Plan
          </Button>
          <Button variant="outline" onClick={() => router.push(`/recipes/${recipe.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">{recipe.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {recipe.image_url && (
            <div className="w-full max-h-[300px] overflow-hidden rounded-md flex items-center justify-center">
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
            <h3 className="text-lg font-medium mb-2">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ingredient: Ingredient, index: number) => (
                <li key={index}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Instructions</h3>
            <div className="text-gray-300 whitespace-pre-line">{recipe.instructions}</div>
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
