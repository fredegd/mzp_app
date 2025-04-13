"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MealPlan } from "@/types/meal-planner"
import { deleteMealPlan } from "@/lib/meal-planner"
import EditMealPlanDialog from "./edit-meal-plan-dialog"

interface MealPlanItemProps {
  mealPlan: MealPlan
  onUpdate: () => void
}

export default function MealPlanItem({ mealPlan, onUpdate }: MealPlanItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "lunch":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50"
      case "dinner":
        return "bg-purple-500/20 text-purple-500 border-purple-500/50"
      case "snack":
        return "bg-green-500/20 text-green-500 border-green-500/50"
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50"
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMealPlan(mealPlan.id)
      onUpdate()
    } catch (error) {
      console.error("Error deleting meal plan:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <div className="p-2 rounded-md bg-[#252525] border border-gray-700 text-sm">
        <div className="flex items-center justify-between mb-1">
          <Badge className={`${getMealTypeColor(mealPlan.meal_type)} capitalize`}>{mealPlan.meal_type}</Badge>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-red-400"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="font-medium">{mealPlan.recipe ? mealPlan.recipe.name : "No recipe selected"}</div>

        {mealPlan.notes && <div className="text-xs text-gray-400 mt-1">{mealPlan.notes}</div>}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#1c1c1c] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Meal Plan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this meal plan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditMealPlanDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mealPlan={mealPlan}
        onMealUpdated={onUpdate}
      />
    </>
  )
}
