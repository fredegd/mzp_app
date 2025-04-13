export interface Recipe {
  id: string
  user_id: string
  name: string
  description: string | null
  ingredients: Ingredient[] | Record<string, Ingredient>
  instructions: string
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Ingredient {
  name: string
  quantity?: number | null
  unit?: string | null
}

export interface MealPlan {
  id: string
  user_id: string
  date: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  recipe_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  recipes?: Recipe
}

export interface ShoppingListItem {
  id: string
  user_id: string
  item: string
  quantity: number | null
  unit: string | null
  checked: boolean
  recipe_id: string | null
  created_at: string
  updated_at: string
}

export interface WeekRange {
  start: Date
  end: Date
}
