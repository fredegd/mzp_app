"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { getRecipes, updateMealPlan } from "@/lib/meal-planner"
import type { Recipe, MealPlan, MealType } from "@/types/meal-planner"

interface EditMealPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealPlan: MealPlan
  onMealUpdated: () => void
}

export default function EditMealPlanDialog({ open, onOpenChange, mealPlan, onMealUpdated }: EditMealPlanDialogProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mealType, setMealType] = useState<MealType>(mealPlan.meal_type)
  const [recipeId, setRecipeId] = useState<string>(mealPlan.recipe_id || "")
  const [notes, setNotes] = useState(mealPlan.notes || "")

  useEffect(() => {
    // Update form when mealPlan changes
    setMealType(mealPlan.meal_type)
    setRecipeId(mealPlan.recipe_id || "")
    setNotes(mealPlan.notes || "")
  }, [mealPlan])

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const { recipes: data, error } = await getRecipes()

        if (error) {
          console.error("Error fetching recipes:", error)
        } else if (data) {
          setRecipes(data)
        }
      } catch (error) {
        console.error("Error fetching recipes:", error)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchRecipes()
    }
  }, [open])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const { error } = await updateMealPlan(mealPlan.id, {
        meal_type: mealType,
        recipe_id: recipeId || null,
        notes: notes || null,
      })

      if (error) {
        setError(error)
      } else {
        onMealUpdated()
        onOpenChange(false)
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1c1c1c] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Meal Plan</DialogTitle>
        </DialogHeader>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
              <SelectTrigger className="bg-[#252525] border-gray-700 text-white">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent className="bg-[#252525] border-gray-700 text-white">
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipe">Recipe (optional)</Label>
            <Select value={recipeId} onValueChange={setRecipeId}>
              <SelectTrigger className="bg-[#252525] border-gray-700 text-white">
                <SelectValue placeholder="Select a recipe" />
              </SelectTrigger>
              <SelectContent className="bg-[#252525] border-gray-700 text-white max-h-[200px]">
                {loading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading recipes...
                  </div>
                ) : recipes.length > 0 ? (
                  recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No recipes found</div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-[#252525] border-gray-700 text-white min-h-[100px]"
              placeholder="Add any notes about this meal..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-[#2b725e] hover:bg-[#235e4c] text-white">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Meal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
