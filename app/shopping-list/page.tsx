import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calendar } from "lucide-react"
import ShoppingList from "@/components/shopping-list/shopping-list"

export default function ShoppingListPage() {
    return (
        <div className="container max-w-7xl mx-auto p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">Shopping List</h1>
                <Link href="/meal-planner">
                    <Button variant="outline" className="flex gap-2 items-center">
                        <Calendar className="h-4 w-4" />
                        Go to Calender
                    </Button>
                </Link>
            </div>

            <Card className="shadow-md mb-6">
                <CardContent className="p-6">
                    <p className="text-gray-400">
                        Manage your shopping list. Add items manually or generate a list automatically from your meal plan.
                        Check off items as you shop and keep track of what you need to buy.
                    </p>
                </CardContent>
            </Card>

            <Suspense fallback={
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            }>
                <ShoppingList />
            </Suspense>
        </div>
    )
} 