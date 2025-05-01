"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2, Grid, List } from "lucide-react"
import { getRecipes } from "@/lib/meal-planner"
import type { Recipe } from "@/types/meal-planner"
import RecipeCard from "@/components/recipes/recipe-card"

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true)
            try {
                const { recipes: data, error } = await getRecipes()
                if (error) {
                    console.error("Error fetching recipes:", error)
                } else if (data) {
                    setRecipes(data)
                    setFilteredRecipes(data)

                    console.log(data)
                }
            } catch (error) {
                console.error("Error fetching recipes:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecipes()
    }, [])

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredRecipes(recipes)
        } else {
            const query = searchQuery.toLowerCase()
            const filtered = recipes.filter(
                recipe =>
                    recipe.name.toLowerCase().includes(query) ||
                    (recipe.description && recipe.description.toLowerCase().includes(query))
            )
            setFilteredRecipes(filtered)
        }
    }, [searchQuery, recipes])

    return (
        <div className="container max-w-7xl mx-auto p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Recipes</h1>
                <Link href="/recipes/new">
                    <Button className="bg-[#2b725e] hover:bg-[#235e4c]  ">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Recipe
                    </Button>
                </Link>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search recipes..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10  border-gray-700  "
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-[#2b725e] hover:bg-[#235e4c]" : ""}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-[#2b725e] hover:bg-[#235e4c]" : ""}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : filteredRecipes.length > 0 ? (
                <div className={viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "grid grid-cols-1 gap-4"
                }>
                    {filteredRecipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12  border border-gray-800 rounded-md">
                    {searchQuery ? (
                        <div className="text-gray-400">
                            <p className="mb-2">No recipes found matching &quot;{searchQuery}&quot;</p>
                            <Button variant="outline" onClick={() => setSearchQuery("")}>
                                Clear Search
                            </Button>
                        </div>
                    ) : (
                        <div className="text-gray-400">
                            <p className="mb-2">You haven&apos;t created any recipes yet</p>
                            <Link href="/recipes/new">
                                <Button className="bg-[#2b725e] hover:bg-[#235e4c]  ">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Recipe
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 