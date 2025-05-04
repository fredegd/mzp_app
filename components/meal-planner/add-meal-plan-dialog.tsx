"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import { getRecipes, createMealPlan } from "@/lib/meal-planner"
import type { Recipe } from "@/types/meal-planner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AddMealPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  onMealAdded: () => void
}

export default function AddMealPlanDialog({ open, onOpenChange, date, onMealAdded }: AddMealPlanDialogProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openRecipeSelector, setOpenRecipeSelector] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const [mealType, setMealType] = useState<string>("dinner")
  const [recipeId, setRecipeId] = useState<string>("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        // Explizit eine hohe Anzahl von Rezepten anfordern, um alle zu bekommen
        const { recipes: data, error } = await getRecipes({
          pageSize: 1000 // Eine hohe Anzahl, um alle Rezepte auf einmal zu holen
        })

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
      const { error } = await createMealPlan({
        date: formatDate(date),
        meal_type: mealType,
        recipe_id: recipeId || null,
        notes: notes || null,
      })

      if (error) {
        setError(error)
      } else {
        onMealAdded()
        onOpenChange(false)
        resetForm()
      }
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setMealType("dinner")
    setRecipeId("")
    setNotes("")
    setInputValue("")
  }

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => a.name.localeCompare(b.name))
  }, [recipes])

  const selectedRecipe = recipes.find(recipe => recipe.id === recipeId)

  // Funktion zur Filterung der Rezepte basierend auf dem Eingabewert
  const filterRecipes = (value: string) => {
    setInputValue(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-md max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Meal Plan for {date.toLocaleDateString()}</DialogTitle>
        </DialogHeader>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type</Label>
            <Select value={mealType} onValueChange={(value) => setMealType(value)}>
              <SelectTrigger className="border-gray-700">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent className="border-gray-700">
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
              <Popover open={openRecipeSelector} onOpenChange={setOpenRecipeSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openRecipeSelector}
                    aria-label="Select a recipe"
                    className="w-full justify-between border-gray-700 h-auto py-3"
                  >
                    {recipeId ? (
                      <div className="flex items-center gap-2 text-left">
                        {selectedRecipe?.image_url ? (
                          <div className="relative w-10 h-10 rounded overflow-hidden">
                            <Image
                              src={selectedRecipe.image_url}
                              alt={selectedRecipe.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-sm">No img</span>
                          </div>
                        )}
                        <span>{selectedRecipe?.name}</span>
                      </div>
                    ) : (
                      "Select a recipe"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command shouldFilter={true} filter={(value, search) => {
                    if (search === "") return 1;
                    const recipe = sortedRecipes.find(recipe => recipe.id === value);
                    if (!recipe) return 0;

                    // Überprüfe Name und Beschreibung
                    const nameMatch = recipe.name.toLowerCase().includes(search.toLowerCase());
                    const descMatch = recipe.description?.toLowerCase().includes(search.toLowerCase()) || false;

                    return nameMatch || descMatch ? 1 : 0;
                  }}>
                    <CommandInput
                      placeholder="Search recipes..."
                      value={inputValue}
                      onValueChange={filterRecipes}
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>No recipe found.</CommandEmpty>
                      <CommandGroup>
                        {sortedRecipes.map((recipe) => (
                          <CommandItem
                            key={recipe.id}
                            value={recipe.id}
                            onSelect={(value) => {
                              setRecipeId(value)
                              setOpenRecipeSelector(false)
                              setInputValue("")
                            }}
                            className="py-2 px-2"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                {recipe.image_url ? (
                                  <Image
                                    src={recipe.image_url}
                                    alt={recipe.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <span className="text-xs text-center">No image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col flex-grow overflow-hidden">
                                <span className="font-medium truncate">{recipe.name}</span>
                                {recipe.description && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {recipe.description}
                                  </span>
                                )}
                                <div className="flex gap-2 mt-1">
                                  {recipe.prep_time && (
                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                      Prep: {recipe.prep_time} min
                                    </span>
                                  )}
                                  {recipe.cook_time && (
                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                      Cook: {recipe.cook_time} min
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  recipeId === recipe.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-gray-700 min-h-[100px]"
              placeholder="Add any notes about this meal..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-[#2b725e] hover:bg-[#235e4c]">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Meal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
