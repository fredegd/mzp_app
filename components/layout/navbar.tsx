"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, ChefHat, Calendar, ShoppingCart, User, Home, ChevronDown } from "lucide-react"
import { signOut } from "@/lib/actions"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "./theme-toggle"

export default function Navbar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Get user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user?.email) {
        setUserEmail(data.user.email)
      }
    }

    getUserEmail()
  }, [])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  // Get first letter of email to use as avatar fallback
  const getInitial = () => {
    if (!userEmail) return "U"
    return userEmail.charAt(0).toUpperCase()
  }

  return (
    <>

      <nav className="border-b border-border py-4 h-16">
        <div className="flex justify-between h-16 fixed top-0 left-0 right-0  px-6 py-4 bg-background">
          <Link href="/dashboard" className="text-xl font-bold text-foreground">
            Mahlzeit          </Link>
          <div className="md:flex items-center space-x-8 hidden  justify-around h-16 fixed top-0 left-0 right-0 z-50 px-2 py-4">
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
                  Calender
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
            {/* User dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <Avatar className="h-8 w-8 mr-1">
                    <AvatarFallback>{getInitial()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block">{userEmail || 'User'}</span>
                  {/* <ChevronDown className="h-4 w-4" /> */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ThemeToggle />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </Link>

                <form action={signOut}>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <button className="w-full flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Mobile navigation */}
        <div className=" md:hidden flex justify-around h-16 fixed bottom-0 left-0 right-0  px-2 py-4 z-50 bg-background">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                isActive("/dashboard") && "bg-primary text-primary-foreground"
              )}
            >
              <Home className="h-4 w-4" />
              {isActive("/dashboard") && "Dashboard"}
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
              {isActive("/recipes") && "Recipes"}
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
              {isActive("/meal-planner") && "Calender"}
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
              {isActive("/shopping-list") && "Shopping List"}
            </Button>
          </Link>

        </div>
      </nav>

    </>
  )
}
