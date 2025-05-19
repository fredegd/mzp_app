import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, UtensilsCrossed, ShoppingCart, Calendar, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils/date"
import RecipeCard from "@/components/recipes/recipe-card"

export default async function DashboardPage() {
    const supabase = await createClient()
    // Get recent recipes (limit 3)
    const { data: recipes } = await supabase
        .from("recipes")
        .select("*")
        .order("updated_at", { ascending: false })

    // Get upcoming meal plans
    const today = formatDate(new Date())
    const { data: mealPlans } = await supabase
        .from("meal_plans")
        .select(`
      *,
      recipes (
        name
      )
    `)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(3)

    // Get shopping list stats
    const { count: totalShoppingItems } = await supabase
        .from("shopping_list")
        .select("*", { count: "exact", head: true })

    const { count: completedShoppingItems } = await supabase
        .from("shopping_list")
        .select("*", { count: "exact", head: true })
        .eq("checked", true)

    return (
        <div className="container max-w-7xl mx-auto p-4 mb-16">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Recipes Card */}

                <Link href="/recipes" >
                    <Card className="shadow-md h-full w-full">
                        <CardHeader className="p-6">
                            <CardTitle className="text-xl flex items-center">
                                <UtensilsCrossed className="h-5 w-5 mr-2 text-[#2b725e]" />
                                Recipes
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                {recipes?.length || 0} total recipes
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Meal Plans Card */}
                <Link href="/meal-planner" >
                    <Card className="shadow-md h-full w-full">
                        <CardHeader className="p-6">
                            <CardTitle className="text-xl flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-[#2b725e]" />
                                Calendar
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Plan your weekly meals
                            </CardDescription>
                        </CardHeader>

                    </Card>
                </Link>

                {/* Shopping List Card */}
                <Link href="/shopping-list" >
                    <Card className="shadow-md h-full w-full">
                        <CardHeader className="p-6">
                            <CardTitle className="text-xl flex items-center">
                                <ShoppingCart className="h-5 w-5 mr-2 text-[#2b725e]" />
                                Shopping List
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                {completedShoppingItems || 0}/{totalShoppingItems || 0} items completed
                            </CardDescription>
                        </CardHeader>

                    </Card>
                </Link>

                {/* Profile Card */}
                <Card className="shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-[#2b725e]" />
                            Quick Add
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Add new items quickly
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex gap-4">
                        <Link href="/recipes/new" className="flex-1">
                            <Button variant="outline" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Recipe</Button>
                        </Link>
                        <Link href="/meal-planner" className="flex-1">
                            <Button variant="outline" className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Meal Plan</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            {/* Recent Recipes */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Recent Recipes</h2>
                    <Link href="/recipes">
                        <Button variant="link" className="text-[#2b725e]">View All</Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recipes && recipes.length > 0 ? (
                        recipes.slice(0, 3).map((recipe) => (
                            // <Card key={recipe.id} className="shadow-md">
                            //     <CardHeader>
                            //         <CardTitle className="line-clamp-1">{recipe.name}</CardTitle>
                            //     </CardHeader>
                            //     <CardContent>
                            //         <p className="text-gray-400 text-sm line-clamp-2">{recipe.description || "No description available."}</p>
                            //     </CardContent>
                            //     <CardFooter>
                            //         <Link href={`/recipes/${recipe.id}`} className="w-full">
                            //             <Button variant="outline" className="w-full">View Recipe</Button>
                            //         </Link>
                            //     </CardFooter>
                            // </Card>
                            <RecipeCard key={recipe.id} recipe={recipe} viewMode="grid" />
                        ))
                    ) : (
                        <Card className="col-span-3 shadow-md">
                            <CardContent className="p-6 text-center text-gray-400">
                                <p>No recipes created yet.</p>
                                <Link href="/recipes/new">
                                    <Button variant="outline" className="mt-4">Create Your First Recipe</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Upcoming Meals */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Upcoming Meals</h2>
                    <Link href="/meal-planner">
                        <Button variant="link" className="text-[#2b725e]">View All</Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mealPlans && mealPlans.length > 0 ? (
                        mealPlans.map((meal) => (


                            <Link href="/meal-planner" className="w-full">
                                <Card key={meal.id} className="shadow-md">
                                    <CardHeader>
                                        <CardTitle className="capitalize">{new Date(meal.date).toLocaleDateString()} - {meal.meal_type}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="font-medium">{meal.recipes?.name || "No recipe selected"}</p>
                                        {meal.notes && <p className="text-gray-400 text-sm mt-2">{meal.notes}</p>}
                                    </CardContent>

                                </Card>
                            </Link>
                        ))
                    ) : (
                        <Card className="col-span-3 shadow-md">
                            <CardContent className="p-6 text-center text-gray-400">
                                <p>No upcoming meals planned.</p>
                                <Link href="/meal-planner">
                                    <Button variant="outline" className="mt-4">Plan Your Meals</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
} 