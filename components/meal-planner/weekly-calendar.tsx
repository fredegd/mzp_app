"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { getWeekRange, formatDate, formatDisplayDate, getDayName } from "@/lib/utils/date"
import { getMealPlans } from "@/lib/meal-planner"
import type { MealPlan, WeekRange } from "@/types/meal-planner"
import MealPlanItem from "./meal-plan-item"
import AddMealPlanDialog from "./add-meal-plan-dialog"

export default function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekRange, setWeekRange] = useState<WeekRange>(getWeekRange(currentDate))
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    setWeekRange(getWeekRange(currentDate))
  }, [currentDate])

  useEffect(() => {
    const fetchMealPlans = async () => {
      setLoading(true)
      try {
        const startDateStr = formatDate(weekRange.start)
        const endDateStr = formatDate(weekRange.end)
        const { mealPlans: data, error } = await getMealPlans(startDateStr, endDateStr)

        if (error) {
          console.error("Error fetching meal plans:", error)
        } else if (data) {
          setMealPlans(data)
        }
      } catch (error) {
        console.error("Error fetching meal plans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlans()
  }, [weekRange])

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const goToCurrentWeek = () => {
    setCurrentDate(new Date())
  }

  const getDaysInWeek = () => {
    const days = []
    const startDate = new Date(weekRange.start)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }

    return days
  }

  const getMealsForDay = (date: Date) => {
    const dateStr = formatDate(date)
    return mealPlans.filter((plan) => plan.date === dateStr)
  }

  const handleAddMeal = (date: Date) => {
    setSelectedDate(date)
    setAddDialogOpen(true)
  }

  const handleMealAdded = () => {
    // Refresh meal plans
    const startDateStr = formatDate(weekRange.start)
    const endDateStr = formatDate(weekRange.end)
    getMealPlans(startDateStr, endDateStr).then(({ mealPlans: data }) => {
      if (data) {
        setMealPlans(data)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="text-gray-400 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToCurrentWeek} className="text-gray-400 hover:text-white">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek} className="text-gray-400 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-lg font-medium">
          {formatDisplayDate(weekRange.start)} - {formatDisplayDate(weekRange.end)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {getDaysInWeek().map((date) => {
          const dayMeals = getMealsForDay(date)
          const isToday = new Date().toDateString() === date.toDateString()

          return (
            <Card
              key={date.toISOString()}
              className={`bg-[#1c1c1c] border-gray-800 ${isToday ? "ring-2 ring-[#2b725e]" : ""}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">{getDayName(date)}</div>
                    <div className={isToday ? "text-[#2b725e]" : ""}>{date.getDate()}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddMeal(date)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {loading ? (
                  <div className="text-center text-gray-500 text-sm py-2">Loading...</div>
                ) : dayMeals.length > 0 ? (
                  dayMeals.map((meal) => <MealPlanItem key={meal.id} mealPlan={meal} onUpdate={handleMealAdded} />)
                ) : (
                  <div className="text-center text-gray-500 text-sm py-2">No meals planned</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedDate && (
        <AddMealPlanDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          date={selectedDate}
          onMealAdded={handleMealAdded}
        />
      )}
    </div>
  )
}
