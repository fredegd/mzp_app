"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, ChefHat, Calendar, ShoppingCart, User } from "lucide-react"
import { signOut } from "@/lib/actions"

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  return (
    <nav className="border-b border-gray-800 bg-[#161616] py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            MealPlanner
          </Link>
          <div className="hidden md:flex space-x-1">
            <Link href="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className={isActive("/dashboard") ? "bg-[#2b725e] text-white" : "text-gray-300"}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/recipes">
              <Button
                variant={isActive("/recipes") ? "default" : "ghost"}
                className={isActive("/recipes") ? "bg-[#2b725e] text-white" : "text-gray-300"}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Recipes
              </Button>
            </Link>
            <Link href="/meal-planner">
              <Button
                variant={isActive("/meal-planner") ? "default" : "ghost"}
                className={isActive("/meal-planner") ? "bg-[#2b725e] text-white" : "text-gray-300"}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Meal Planner
              </Button>
            </Link>
            <Link href="/shopping-list">
              <Button
                variant={isActive("/shopping-list") ? "default" : "ghost"}
                className={isActive("/shopping-list") ? "bg-[#2b725e] text-white" : "text-gray-300"}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shopping List
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/profile">
            <Button
              variant={isActive("/profile") ? "default" : "ghost"}
              className={isActive("/profile") ? "bg-[#2b725e] text-white" : "text-gray-300"}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="text-gray-300">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden flex justify-around mt-4 px-4 pb-2">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className={isActive("/dashboard") ? "bg-[#2b725e] text-white" : "text-gray-300"}
          >
            Dashboard
          </Button>
        </Link>
        <Link href="/recipes">
          <Button
            variant="ghost"
            size="sm"
            className={isActive("/recipes") ? "bg-[#2b725e] text-white" : "text-gray-300"}
          >
            <ChefHat className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/meal-planner">
          <Button
            variant="ghost"
            size="sm"
            className={isActive("/meal-planner") ? "bg-[#2b725e] text-white" : "text-gray-300"}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/shopping-list">
          <Button
            variant="ghost"
            size="sm"
            className={isActive("/shopping-list") ? "bg-[#2b725e] text-white" : "text-gray-300"}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </nav>
  )
}
