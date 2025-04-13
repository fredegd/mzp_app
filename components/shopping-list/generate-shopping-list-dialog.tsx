"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Loader2, CalendarIcon } from "lucide-react"
import { formatDisplayDate, getWeekRange } from "@/lib/utils/date"

interface GenerateShoppingListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (startDate: Date, endDate: Date) => Promise<{ success: boolean; message: string }>
}

export default function GenerateShoppingListDialog({
  open,
  onOpenChange,
  onGenerate,
}: GenerateShoppingListDialogProps) {
  const [startDate, setStartDate] = useState<Date>(getWeekRange(new Date()).start)
  const [endDate, setEndDate] = useState<Date>(getWeekRange(new Date()).end)
  const [startCalendarOpen, setStartCalendarOpen] = useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const result = await onGenerate(startDate, endDate)
      setResult(result)

      if (result.success) {
        setTimeout(() => {
          onOpenChange(false)
          setResult(null)
        }, 1500)
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-md">
        <DialogHeader>
          <DialogTitle>Generate Shopping List</DialogTitle>
          <DialogDescription className="text-gray-400">
            Generate a shopping list based on your meal plan for a specific date range.
          </DialogDescription>
        </DialogHeader>

        {result && (
          <div
            className={`p-4 rounded-md ${result.success
              ? "bg-green-500/10 border border-green-500/50 text-green-700"
              : "bg-red-500/10 border border-red-500/50 text-red-700"
              }`}
          >
            {result.message}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Start Date</label>
              <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal  border-gray-700 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDisplayDate(startDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0  border-gray-700">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date)
                        setStartCalendarOpen(false)

                        // If end date is before start date, update it
                        if (date > endDate) {
                          setEndDate(date)
                        }
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">End Date</label>
              <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal  border-gray-700 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDisplayDate(endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0  border-gray-700">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date)
                        setEndCalendarOpen(false)

                        // If start date is after end date, update it
                        if (date < startDate) {
                          setStartDate(date)
                        }
                      }
                    }}
                    initialFocus
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            This will generate a shopping list based on all recipes in your meal plan for the selected date range. Any
            existing items in your shopping list will be replaced.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={loading} className="bg-[#2b725e] hover:bg-[#235e4c] text-white">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate List"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
