"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"
import { getRecipes, updateMealPlan } from "@/lib/meal-planner"
import type { Recipe, MealPlan } from "@/types/meal-planner"

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

  const [mealType, setMealType] = useState<MealPlan['meal_type']>(mealPlan.meal_type)
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

  const sortedRecipes = recipes.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-md">
        <DialogHeader>
          <DialogTitle>Edit Meal Plan</DialogTitle>
        </DialogHeader>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={(value) => setMealType(value as MealPlan['meal_type'])}>
              <SelectTrigger className=" border-gray-700  ">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent className=" border-gray-700  ">
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipe">Recipe (optional)</Label>
            {loading ? (
              <div className="flex items-center justify-center p-2 h-10 border border-gray-700 rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading recipes...
              </div>
            ) : (
              <Combobox
                options={sortedRecipes.map((recipe) => ({
                  value: recipe.id,
                  label: recipe.name,
                }))}
                value={recipeId}
                onChange={setRecipeId}
                placeholder="Select a recipe"
                searchPlaceholder="Search recipes..."
                emptyPlaceholder="No recipe found."
                className="border-gray-700"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className=" border-gray-700   min-h-[100px]"
              placeholder="Add any notes about this meal..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-[#2b725e] hover:bg-[#235e4c]  ">
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
