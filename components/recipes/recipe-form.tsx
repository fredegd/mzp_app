"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import type { Recipe, Ingredient } from "@/types/meal-planner"
import { createRecipe, updateRecipe } from "@/lib/meal-planner"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Define unit options and sort them alphabetically
const unitOptions = [
  "none",
  "g",
  "kg",
  "ml",
  "Liter",
  "EL",
  "TL",
  "Tasse",
  "Stück",
  "Packung",
  "Päckchen",
  "Dose",
  "Glas",
  "Scheibe",
  "Blatt",
  "Bund",
  "Stange",
  "Stiel",
  "Zweig",
  "Zehe",
  "Handvoll",
  "Prise",
  "Kugel",
  "Kästchen",
  "Topf",
  "Beutel",
  "Tropfen",
  "Würfel",
  "Tüte"
].sort();

interface RecipeFormProps {
  initialRecipe?: Recipe
  isEditing?: boolean
}

export default function RecipeForm({ initialRecipe, isEditing = false }: RecipeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialRecipe?.name || "")
  const [description, setDescription] = useState(initialRecipe?.description || "")
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [{ name: "", quantity: 1, unit: "" }],
  )
  const [instructions, setInstructions] = useState(initialRecipe?.instructions || "")
  const [prepTime, setPrepTime] = useState(initialRecipe?.prep_time?.toString() || "")
  const [cookTime, setCookTime] = useState(initialRecipe?.cook_time?.toString() || "")
  const [servings, setServings] = useState(initialRecipe?.servings?.toString() || "")
  const [imageUrl, setImageUrl] = useState(initialRecipe?.image_url || "")
  const [openUnitPopover, setOpenUnitPopover] = useState<number | null>(null)

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 1, unit: "" }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = [...ingredients]
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: field === "quantity" ? Number.parseFloat(value as string) || 0 : value,
    }
    setIngredients(updatedIngredients)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate form
    if (!name.trim()) {
      setError("Recipe name is required")
      setLoading(false)
      return
    }

    if (ingredients.some((ing) => !ing.name.trim())) {
      setError("All ingredients must have a name")
      setLoading(false)
      return
    }

    if (!instructions.trim()) {
      setError("Instructions are required")
      setLoading(false)
      return
    }

    const recipeData = {
      name,
      description,
      ingredients,
      instructions,
      prep_time: prepTime ? Number.parseInt(prepTime) : null,
      cook_time: cookTime ? Number.parseInt(cookTime) : null,
      servings: servings ? Number.parseInt(servings) : null,
      image_url: imageUrl || null,
    }

    try {
      if (isEditing && initialRecipe) {
        const { error: updateError } = await updateRecipe(initialRecipe.id, recipeData)
        if (updateError) throw new Error(updateError)
        router.push(`/recipes/${initialRecipe.id}`)
      } else {
        const { error: createError } = await createRecipe(recipeData as any)
        if (createError) throw new Error(createError)
        router.push("/recipes")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Recipe" : "Create New Recipe"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Recipe Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className=" border-gray-700  "
              placeholder="e.g., Spaghetti Carbonara"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              className=" border-gray-700   min-h-[100px]"
              placeholder="Describe your recipe..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center ">
              <Label>Ingredients</Label>

            </div>

            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex flex-col gap-2 md:flex-row items-center relative">
                <div className="w-full md:w-2/3 md:pr-2">
                  <Input
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                    className=" border-gray-700  "
                    placeholder="e.g., Flour"
                  />
                </div>
                <div className="w-full md:w-1/3 flex gap-2">
                  <div className="w-1/2 max-w-1/2">
                    <Input
                      type="number"
                      value={ingredient.quantity ?? 1}
                      onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                      className=" border-gray-700  "
                      placeholder="Qty"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="w-1/2 max-w-1/2">
                    <Popover open={openUnitPopover === index} onOpenChange={(open) => setOpenUnitPopover(open ? index : null)}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openUnitPopover === index}
                          className="w-full justify-between border-gray-700"
                        >
                          {ingredient.unit || "Select unit"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search unit..." />
                          <CommandEmpty>No unit found.</CommandEmpty>
                          <CommandGroup className="max-h-60 overflow-y-auto">
                            {unitOptions.map((unit) => (
                              <CommandItem
                                key={unit}
                                value={unit}
                                onSelect={() => {
                                  updateIngredient(index, "unit", unit)
                                  setOpenUnitPopover(null)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    ingredient.unit === unit ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {unit}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    className="text-red-500 hover:text-red-400 "
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngredient}
              className="text-[#2b725e] border-[#2b725e]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Zubereitung</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className=" border-gray-700   min-h-[200px]"
              placeholder="Step-by-step instructions..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time (minutes)</Label>
              <Input
                id="prepTime"
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className=" border-gray-700  "
                placeholder="e.g., 15"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookTime">Cook Time (minutes)</Label>
              <Input
                id="cookTime"
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                className=" border-gray-700  "
                placeholder="e.g., 30"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                className=" border-gray-700  "
                placeholder="e.g., 4"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              value={imageUrl || ""}
              onChange={(e) => setImageUrl(e.target.value)}
              className=" border-gray-700  "
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#2b725e] hover:bg-[#235e4c]  ">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Recipe"
            ) : (
              "Create Recipe"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
