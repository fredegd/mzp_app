"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Recipe, MealPlan, ShoppingListItem, Ingredient } from "@/types/meal-planner"

// Get the current user's ID
async function getUserId() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id
}

// RECIPE FUNCTIONS
export async function getRecipes() {
  const supabase = createClient()

  const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching recipes:", error)
    return { error: error.message }
  }

  return { recipes: data as Recipe[] }
}

export async function getRecipe(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching recipe:", error)
    return { error: error.message }
  }

  return { recipe: data as Recipe }
}

export async function createRecipe(recipe: Omit<Recipe, "id" | "user_id" | "created_at" | "updated_at">) {
  const supabase = createClient()
  const userId = await getUserId()

  if (!userId) {
    return { error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("recipes")
    .insert([
      {
        ...recipe,
        user_id: userId,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating recipe:", error)
    return { error: error.message }
  }

  revalidatePath("/recipes")
  return { recipe: data[0] as Recipe }
}

export async function updateRecipe(id: string, recipe: Partial<Recipe>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("recipes")
    .update({
      ...recipe,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating recipe:", error)
    return { error: error.message }
  }

  revalidatePath("/recipes")
  revalidatePath(`/recipes/${id}`)
  return { recipe: data[0] as Recipe }
}

export async function deleteRecipe(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("recipes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting recipe:", error)
    return { error: error.message }
  }

  revalidatePath("/recipes")
  return { success: true }
}

// MEAL PLAN FUNCTIONS
export async function getMealPlans(startDate: string, endDate: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("meal_plans")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching meal plans:", error)
    return { error: error.message }
  }

  return { mealPlans: data as (MealPlan & { recipe: Recipe | null })[] }
}

export async function createMealPlan(mealPlan: {
  date: string
  meal_type: string
  recipe_id: string | null
  notes?: string | null
}) {
  const supabase = createClient()
  const userId = await getUserId()

  if (!userId) {
    return { error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("meal_plans")
    .insert([
      {
        ...mealPlan,
        user_id: userId,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating meal plan:", error)
    return { error: error.message }
  }

  revalidatePath("/meal-planner")
  return { mealPlan: data[0] as MealPlan }
}

export async function updateMealPlan(id: string, mealPlan: Partial<MealPlan>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("meal_plans")
    .update({
      ...mealPlan,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating meal plan:", error)
    return { error: error.message }
  }

  revalidatePath("/meal-planner")
  return { mealPlan: data[0] as MealPlan }
}

export async function deleteMealPlan(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("meal_plans").delete().eq("id", id)

  if (error) {
    console.error("Error deleting meal plan:", error)
    return { error: error.message }
  }

  revalidatePath("/meal-planner")
  return { success: true }
}

// SHOPPING LIST FUNCTIONS
export async function getShoppingList() {
  const supabase = createClient()

  const { data, error } = await supabase.from("shopping_list").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching shopping list:", error)
    return { error: error.message }
  }

  return { items: data as ShoppingListItem[] }
}

export async function createShoppingListItem(item: {
  item: string
  quantity?: number | null
  unit?: string | null
  recipe_id?: string | null
}) {
  const supabase = createClient()
  const userId = await getUserId()

  if (!userId) {
    return { error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("shopping_list")
    .insert([
      {
        ...item,
        user_id: userId,
        checked: false,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating shopping list item:", error)
    return { error: error.message }
  }

  revalidatePath("/shopping-list")
  return { item: data[0] as ShoppingListItem }
}

export async function updateShoppingListItem(id: string, item: Partial<ShoppingListItem>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("shopping_list")
    .update({
      ...item,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating shopping list item:", error)
    return { error: error.message }
  }

  revalidatePath("/shopping-list")
  return { item: data[0] as ShoppingListItem }
}

export async function deleteShoppingListItem(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from("shopping_list").delete().eq("id", id)

  if (error) {
    console.error("Error deleting shopping list item:", error)
    return { error: error.message }
  }

  revalidatePath("/shopping-list")
  return { success: true }
}

export async function toggleShoppingListItem(id: string, checked: boolean) {
  return updateShoppingListItem(id, { checked })
}

export async function generateShoppingList(startDate: string, endDate: string) {
  const supabase = createClient()
  const userId = await getUserId()

  if (!userId) {
    return { error: "User not authenticated" }
  }

  // Get meal plans for the date range
  const { data: mealPlans, error: mealPlansError } = await supabase
    .from("meal_plans")
    .select(`
      *,
      recipe:recipes(*)
    `)
    .gte("date", startDate)
    .lte("date", endDate)
    .not("recipe_id", "is", null)

  if (mealPlansError) {
    console.error("Error fetching meal plans:", mealPlansError)
    return { error: mealPlansError.message }
  }

  // Clear existing shopping list
  const { error: clearError } = await supabase.from("shopping_list").delete().eq("user_id", userId)

  if (clearError) {
    console.error("Error clearing shopping list:", clearError)
    return { error: clearError.message }
  }

  // Create new shopping list items from recipes
  const shoppingItems: { item: string; quantity: number; unit: string; recipe_id: string; user_id: string }[] = []

  mealPlans?.forEach((mealPlan: any) => {
    if (mealPlan.recipe && mealPlan.recipe.ingredients) {
      mealPlan.recipe.ingredients.forEach((ingredient: Ingredient) => {
        shoppingItems.push({
          item: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          recipe_id: mealPlan.recipe_id!,
          user_id: userId,
        })
      })
    }
  })

  if (shoppingItems.length > 0) {
    const { error: insertError } = await supabase.from("shopping_list").insert(shoppingItems)

    if (insertError) {
      console.error("Error creating shopping list:", insertError)
      return { error: insertError.message }
    }
  }

  revalidatePath("/shopping-list")
  return { success: true, itemCount: shoppingItems.length }
}
