"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type { Recipe, Ingredient } from "@/types/meal-planner"
import { createRecipe, updateRecipe } from "@/lib/meal-planner"

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
            <div className="flex items-center justify-between">
              <Label>Ingredients</Label>
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

            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                    className=" border-gray-700  "
                    placeholder="e.g., Flour"
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                    className=" border-gray-700  "
                    placeholder="Qty"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="w-24">
                  <Input
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                    className=" border-gray-700  "
                    placeholder="e.g., cups"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
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
