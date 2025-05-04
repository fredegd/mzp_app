"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  Recipe,
  MealPlan,
  ShoppingListItem,
  Ingredient,
} from "@/types/meal-planner";

// Define a type for the consolidated ingredient map
type ConsolidatedIngredients = {
  [key: string]: {
    item: string;
    quantity: number | null;
    unit: string | null;
    recipe_ids: Set<string>; // Keep track of which recipes this ingredient came from
  };
};

// Get the current user's ID
async function getUserId() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

// RECIPE FUNCTIONS
export async function getRecipes({
  page = 1,
  pageSize = 30,
  sortBy = "name",
  sortOrder = "asc",
}: {
  page?: number;
  pageSize?: number;
  sortBy?: "name" | "created_at" | "updated_at" | "prep_time";
  sortOrder?: "asc" | "desc";
} = {}) {
  try {
    const supabase = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from("recipes")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Get paginated data with sorting
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (error) throw error;

    return {
      recipes: data as Recipe[],
      totalCount: count,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page,
    };
  } catch (error: any) {
    console.error("Error fetching recipes:", error);
    return { error: error.message || "Failed to fetch recipes" };
  }
}

export async function getRecipe(id: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return { recipe: data as Recipe };
  } catch (error: any) {
    console.error("Error fetching recipe:", error);
    return { error: error.message || "Failed to fetch recipe" };
  }
}

export async function createRecipe(
  recipe: Omit<Recipe, "id" | "user_id" | "created_at" | "updated_at">
) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("recipes")
      .insert([{ ...recipe, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Recipe creation failed, no data returned.");

    revalidatePath("/recipes");
    return { recipe: data as Recipe };
  } catch (error: any) {
    console.error("Error creating recipe:", error);
    return { error: error.message || "Failed to create recipe" };
  }
}

export async function updateRecipe(id: string, recipe: Partial<Recipe>) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("recipes")
      .update({ ...recipe, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Recipe update failed, no data returned.");

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${id}`);
    return { recipe: data as Recipe };
  } catch (error: any) {
    console.error("Error updating recipe:", error);
    return { error: error.message || "Failed to update recipe" };
  }
}

export async function deleteRecipe(id: string) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    revalidatePath("/recipes");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting recipe:", error);
    return { error: error.message || "Failed to delete recipe" };
  }
}

// MEAL PLAN FUNCTIONS
export async function getMealPlans(startDate: string, endDate: string) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("meal_plans")
      .select(
        `
      *,
      recipe:recipes(*)
    `
      )
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;

    return { mealPlans: data as (MealPlan & { recipe: Recipe | null })[] };
  } catch (error: any) {
    console.error("Error fetching meal plans:", error);
    return { error: error.message || "Failed to fetch meal plans" };
  }
}

export async function createMealPlan(mealPlan: {
  date: string;
  meal_type: string;
  recipe_id: string | null;
  notes?: string | null;
}) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("meal_plans")
      .insert([{ ...mealPlan, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Meal plan creation failed, no data returned.");

    revalidatePath("/meal-planner");
    return { mealPlan: data as MealPlan };
  } catch (error: any) {
    console.error("Error creating meal plan:", error);
    return { error: error.message || "Failed to create meal plan" };
  }
}

export async function updateMealPlan(id: string, mealPlan: Partial<MealPlan>) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("meal_plans")
      .update({ ...mealPlan, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Meal plan update failed, no data returned.");

    revalidatePath("/meal-planner");
    return { mealPlan: data as MealPlan };
  } catch (error: any) {
    console.error("Error updating meal plan:", error);
    return { error: error.message || "Failed to update meal plan" };
  }
}

export async function deleteMealPlan(id: string) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    revalidatePath("/meal-planner");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting meal plan:", error);
    return { error: error.message || "Failed to delete meal plan" };
  }
}

// SHOPPING LIST FUNCTIONS
export async function getShoppingList() {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    // Fetch shopping list items and include the name from the related recipe
    const { data, error } = await supabase
      .from("shopping_list")
      .select(
        `
        *,
        recipe:recipes (name)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // The type assertion might need adjustment based on the actual returned structure
    return { items: data as ShoppingListItem[] };
  } catch (error: any) {
    console.error("Error fetching shopping list:", error);
    return { error: error.message || "Failed to fetch shopping list" };
  }
}

export async function createShoppingListItem(item: {
  item: string;
  quantity?: number | null;
  unit?: string | null;
  recipe_id?: string | null;
}) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("shopping_list")
      .insert([{ ...item, user_id: userId, checked: false }])
      .select()
      .single();

    if (error) throw error;
    if (!data)
      throw new Error("Shopping list item creation failed, no data returned.");

    revalidatePath("/shopping-list");
    return { item: data as ShoppingListItem };
  } catch (error: any) {
    console.error("Error creating shopping list item:", error);
    return { error: error.message || "Failed to create shopping list item" };
  }
}

export async function updateShoppingListItem(
  id: string,
  item: Partial<ShoppingListItem>
) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { user_id, ...updateData } = item;

    const { data, error } = await supabase
      .from("shopping_list")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    if (!data)
      throw new Error("Shopping list item update failed, no data returned.");

    revalidatePath("/shopping-list");
    return { item: data as ShoppingListItem };
  } catch (error: any) {
    console.error("Error updating shopping list item:", error);
    return { error: error.message || "Failed to update shopping list item" };
  }
}

export async function deleteShoppingListItem(id: string) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("shopping_list")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    revalidatePath("/shopping-list");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting shopping list item:", error);
    return { error: error.message || "Failed to delete shopping list item" };
  }
}

export async function toggleShoppingListItem(id: string, checked: boolean) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("shopping_list")
      .update({ checked, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    revalidatePath("/shopping-list");
    return { success: true };
  } catch (error: any) {
    console.error("Error toggling shopping list item:", error);
    return { error: error.message || "Failed to toggle shopping list item" };
  }
}

// Generates a shopping list based on meal plans within a date range
export async function generateShoppingList(startDate: string, endDate: string) {
  try {
    const supabase = createClient();
    const userId = await getUserId();
    if (!userId) throw new Error("User not authenticated");

    // 1. Fetch Meal Plans with Recipes and Ingredients
    const { data: mealPlansData, error: mealPlanError } = await supabase
      .from("meal_plans")
      .select(
        `
        id,
        recipe:recipes (
          id,
          ingredients
        )
      `
      )
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .not("recipe_id", "is", null);

    if (mealPlanError) {
      console.error(
        "Error fetching meal plans for shopping list:",
        mealPlanError
      );
      throw mealPlanError;
    }

    // 2. Extract All Ingredients
    const allIngredients: (Ingredient & { recipe_id: string })[] = [];
    mealPlansData?.forEach((plan) => {
      // Ensure plan.recipe is a valid object/array and access the first element if array
      let recipe: Recipe | null = null;
      if (plan.recipe) {
        if (Array.isArray(plan.recipe)) {
          // If it's an array, take the first element if it exists
          recipe = plan.recipe.length > 0 ? (plan.recipe[0] as Recipe) : null;
        } else if (typeof plan.recipe === "object") {
          // If it's already an object (unexpected but possible), use it
          recipe = plan.recipe as Recipe;
        }
      }

      // Proceed if we have a valid recipe object
      if (
        recipe &&
        typeof recipe === "object" &&
        Array.isArray(recipe.ingredients)
      ) {
        recipe.ingredients.forEach((ing: any) => {
          // Ensure ingredient has a name
          if (ing && typeof ing.name === "string" && ing.name.trim()) {
            allIngredients.push({
              name: ing.name.trim(),
              quantity: typeof ing.quantity === "number" ? ing.quantity : null,
              unit: typeof ing.unit === "string" ? ing.unit.trim() : null,
              recipe_id: recipe.id, // Use recipe.id safely now
            });
          }
        });
      }
    });

    if (allIngredients.length === 0) {
      return {
        success: true,
        itemCount: 0,
        message: "No ingredients found in the selected meal plan range.",
      };
    }

    // 3. Consolidate Ingredients
    const consolidated: ConsolidatedIngredients = {};
    allIngredients.forEach((ing) => {
      // Ensure unit is string or null for key generation and storage
      const unit = ing.unit ? ing.unit.trim() : null;
      const keyUnit = unit || "pcs"; // Default unit for grouping key if null
      const key = `${ing.name.toLowerCase()}_${keyUnit.toLowerCase()}`; // Key based on name + unit

      if (!consolidated[key]) {
        consolidated[key] = {
          item: ing.name, // Preserve original casing for display
          quantity: null,
          unit: unit, // Store original unit (or null)
          recipe_ids: new Set(),
        };
      }

      // Sum quantities if possible
      if (ing.quantity !== null && typeof ing.quantity === "number") {
        // Only sum if units match (check stored unit vs current ingredient's unit)
        if (consolidated[key].unit === unit) {
          // Initialize quantity if it's null before adding
          if (consolidated[key].quantity === null) {
            consolidated[key].quantity = 0;
          }
          consolidated[key].quantity! += ing.quantity; // Add quantity (use non-null assertion as we init to 0)
        } else {
          // Handle unit mismatch - create a separate entry
          const mismatchKey = `${ing.name.toLowerCase()}_${
            unit || "pcs"
          }_mismatch_${Date.now()}`; // Unique key for mismatch
          consolidated[mismatchKey] = {
            item: ing.name,
            quantity: ing.quantity,
            unit: unit,
            recipe_ids: new Set([ing.recipe_id]),
          };
          // Add recipe_id to the new entry (no need to add to original key)
          consolidated[mismatchKey].recipe_ids.add(ing.recipe_id);
          return; // Skip adding recipe_id to the original key for this ingredient
        }
      }
      // Add recipe ID regardless of quantity summation outcome (unless it was a mismatch)
      consolidated[key].recipe_ids.add(ing.recipe_id);
    });

    // 4. Clear Existing Generated List Items (Optional - Clears all for now)
    // TODO: Implement logic to distinguish/preserve manually added items if needed.
    const { error: deleteError } = await supabase
      .from("shopping_list")
      .delete()
      .eq("user_id", userId);
    // .eq('generated', true); // Example: if we add a 'generated' flag

    if (deleteError) {
      console.error("Error clearing previous shopping list:", deleteError);
      // Decide if we should proceed or return error. For now, proceed.
      // return { error: deleteError.message };
    }

    // 5. Prepare and Insert Consolidated List
    const itemsToInsert = Object.values(consolidated).map((item) => ({
      user_id: userId,
      item: item.item,
      quantity: item.quantity,
      unit: item.unit,
      checked: false,
      // Use the correct column name 'recipe_id'.
      // Store only the *first* recipe ID if multiple exist for a consolidated item.
      // If no recipes associated (e.g., manual item if logic changes), store null.
      recipe_id:
        item.recipe_ids.size > 0 ? Array.from(item.recipe_ids)[0] : null,
    }));

    if (itemsToInsert.length === 0) {
      return {
        success: true,
        itemCount: 0,
        message: "No items to add to the shopping list.",
      };
    }

    const { error: insertError } = await supabase
      .from("shopping_list")
      .insert(itemsToInsert);

    if (insertError) {
      console.error("Error inserting consolidated shopping list:", insertError);
      throw insertError;
    }

    // 6. Revalidate and Return
    revalidatePath("/shopping-list");
    return { success: true, itemCount: itemsToInsert.length };
  } catch (error: any) {
    console.error("Unexpected error generating shopping list:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
