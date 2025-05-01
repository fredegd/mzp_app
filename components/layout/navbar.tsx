"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, ChefHat, Calendar, ShoppingCart, User } from "lucide-react"
import { signOut } from "@/lib/actions"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            MealPlanner
          </Link>
          <div className="hidden md:flex space-x-1">
            <Link href="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className={cn(
                  isActive("/dashboard") && "bg-primary text-primary-foreground"
                )}
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/recipes">
              <Button
                variant={isActive("/recipes") ? "default" : "ghost"}
                className={cn(
                  isActive("/recipes") && "bg-primary text-primary-foreground"
                )}
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Recipes
              </Button>
            </Link>
            <Link href="/meal-planner">
              <Button
                variant={isActive("/meal-planner") ? "default" : "ghost"}
                className={cn(
                  isActive("/meal-planner") && "bg-primary text-primary-foreground"
                )}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Meal Planner
              </Button>
            </Link>
            <Link href="/shopping-list">
              <Button
                variant={isActive("/shopping-list") ? "default" : "ghost"}
                className={cn(
                  isActive("/shopping-list") && "bg-primary text-primary-foreground"
                )}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shopping List
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Link href="/profile">
            <Button
              variant={isActive("/profile") ? "default" : "ghost"}
              className={cn(
                isActive("/profile") && "bg-primary text-primary-foreground"
              )}
            >
              <User className="h-4 w-4 mr-2" />

              <span className="hidden md:block">Profile</span>
            </Button>
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:block">Sign Out</span>

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
            className={cn(
              isActive("/dashboard") && "bg-primary text-primary-foreground"
            )}
          >
            Dashboard
          </Button>
        </Link>
        <Link href="/recipes">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              isActive("/recipes") && "bg-primary text-primary-foreground"
            )}
          >
            <ChefHat className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/meal-planner">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              isActive("/meal-planner") && "bg-primary text-primary-foreground"
            )}
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/shopping-list">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              isActive("/shopping-list") && "bg-primary text-primary-foreground"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </nav>
  )
}
