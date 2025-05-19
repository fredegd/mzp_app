"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Plus,
    Search,
    Loader2,
    Grid,
    List,
    ArrowUp,
    ArrowUpDown,
    AlignLeft,
    Clock,
    CalendarRange
} from "lucide-react"
import { getRecipes } from "@/lib/meal-planner"
import type { Recipe } from "@/types/meal-planner"
import RecipeCard from "@/components/recipes/recipe-card"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

// Safari grid fix styles
const safariFix = `
  @supports (-webkit-hyphens:none) {
    .safari-grid-fix {
      display: -ms-grid;
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    @media (min-width: 640px) {
      .safari-grid-fix.grid-cols-sm-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    
    @media (min-width: 1024px) {
      .safari-grid-fix.grid-cols-lg-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    
    @media (min-width: 1280px) {
      .safari-grid-fix.grid-cols-xl-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  }
`

type SortOption = "name" | "created_at" | "updated_at" | "prep_time"
type SortOrder = "asc" | "desc"

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [sortBy, setSortBy] = useState<SortOption>("name")
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
    const [showScrollTop, setShowScrollTop] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Handle scroll events to show/hide scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowScrollTop(true)
            } else {
                setShowScrollTop(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        fetchRecipes()
    }, [currentPage, sortBy, sortOrder])

    const fetchRecipes = async () => {
        setLoading(true)
        try {
            const { recipes: data, error, totalPages: pages, totalCount: count } = await getRecipes({
                page: currentPage,
                pageSize: 30,
                sortBy,
                sortOrder
            })

            if (error) {
                console.error("Error fetching recipes:", error)
            } else if (data) {
                setRecipes(data)
                setFilteredRecipes(data)
                setTotalPages(pages || 1)
                setTotalCount(count || 0)
            }
        } catch (error) {
            console.error("Error fetching recipes:", error)
        } finally {
            setLoading(false)
        }
    }

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

    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split("-") as [SortOption, SortOrder]
        setSortBy(newSortBy)
        setSortOrder(newSortOrder)
        setCurrentPage(1) // Reset to first page on sort change
    }

    const renderPagination = () => {
        if (totalPages <= 1) return null

        const pageNumbers: number[] = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            // Show all pages if there are not too many
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            // Always include first page
            pageNumbers.push(1)

            // Calculate start and end of the middle range
            let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2))
            let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3)

            // Adjust if we're near the end
            if (endPage - startPage < maxVisiblePages - 3) {
                startPage = Math.max(2, endPage - (maxVisiblePages - 3))
            }

            // Add ellipsis after first page if needed
            if (startPage > 2) {
                pageNumbers.push(-1) // use -1 to represent ellipsis
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i)
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) {
                pageNumbers.push(-2) // use -2 to represent ellipsis
            }

            // Always include last page
            pageNumbers.push(totalPages)
        }

        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {pageNumbers.map((pageNumber, i) => (
                        pageNumber < 0 ? (
                            <PaginationItem key={`ellipsis-${i}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={pageNumber}>
                                <PaginationLink
                                    isActive={pageNumber === currentPage}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className="cursor-pointer"
                                >
                                    {pageNumber}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    return (
        <div className="container max-w-7xl mx-auto p-4 mb-16" ref={containerRef}>
            <style dangerouslySetInnerHTML={{ __html: safariFix }} />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Recipes</h1>
                <Link href="/recipes/new">
                    <Button className="bg-[#2b725e] hover:bg-[#235e4c]  ">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Recipe
                    </Button>
                </Link>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4  z-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search recipes..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 border-gray-700 z-0"
                    />
                </div>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[220px] border-gray-700">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            <span>Sort by</span>
                        </div>
                    </SelectTrigger>
                    <SelectContent className="border-gray-700">
                        <SelectGroup>
                            <SelectLabel>Sort options</SelectLabel>
                            <SelectItem value="name-asc">
                                <div className="flex items-center gap-2">
                                    <AlignLeft className="h-4 w-4" />
                                    <span>Name (A-Z)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="name-desc">
                                <div className="flex items-center gap-2">
                                    <AlignLeft className="h-4 w-4" />
                                    <span>Name (Z-A)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="created_at-desc">
                                <div className="flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4" />
                                    <span>Newest first</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="created_at-asc">
                                <div className="flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4" />
                                    <span>Oldest first</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="updated_at-desc">
                                <div className="flex items-center gap-2">
                                    <CalendarRange className="h-4 w-4" />
                                    <span>Recently updated</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="prep_time-asc">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Prep time (low to high)</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="prep_time-desc">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Prep time (high to low)</span>
                                </div>
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
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
                <>
                    <div className={`safari-grid-fix ${viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full grid-cols-sm-2 grid-cols-lg-3 grid-cols-xl-4"
                        : "grid grid-cols-1 gap-4 w-full"
                        }`}>
                        {filteredRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} viewMode={viewMode} />
                        ))}
                    </div>

                    {renderPagination()}

                    <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
                        <span>
                            Showing {filteredRecipes.length} of {totalCount} recipes
                        </span>
                    </div>
                </>
            ) : (
                <div className="text-center py-12 border border-gray-800 rounded-md">
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

            {showScrollTop && (
                <Button
                    className="fixed bottom-6 right-6 bg-[#2b725e] hover:bg-[#235e4c] rounded-full shadow-lg p-3 z-40"
                    size="icon"
                    onClick={scrollToTop}
                >
                    <ArrowUp className="h-5 w-5" />
                </Button>
            )}
        </div>
    )
}