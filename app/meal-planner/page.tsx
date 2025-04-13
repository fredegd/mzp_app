import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import WeeklyCalendar from "@/components/meal-planner/weekly-calendar"

export default function MealPlannerPage() {
    return (
        <div className="container max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Meal Planner</h1>

            <Card className="bg-[#1c1c1c] border-gray-800 text-white mb-6">
                <CardContent className="p-6">
                    <p className="text-gray-400">
                        Plan your meals for the week by adding recipes to specific days and meal times.
                        Generate shopping lists based on your meal plan to make grocery shopping easier.
                    </p>
                </CardContent>
            </Card>

            <Suspense fallback={
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            }>
                <WeeklyCalendar />
            </Suspense>
        </div>
    )
} 