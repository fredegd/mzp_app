'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { createMealPlan } from '@/lib/meal-planner'

// Define MealType locally
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface AddRecipeToMealPlanDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    recipeId: string
    recipeName: string
    onMealAdded: () => void
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function AddRecipeToMealPlanDialog({
    open,
    onOpenChange,
    recipeId,
    recipeName,
    onMealAdded,
}: AddRecipeToMealPlanDialogProps) {
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [date, setDate] = useState<Date | undefined>(new Date())
    const [mealType, setMealType] = useState<MealType>('dinner')
    const [notes, setNotes] = useState('')
    const [calendarOpen, setCalendarOpen] = useState(false)
    const calendarRef = useRef<HTMLDivElement>(null)

    // Close calendar on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setCalendarOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSubmit = async () => {
        if (!date) {
            setError('Please select a date.')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const { error: apiError } = await createMealPlan({
                date: format(date, 'yyyy-MM-dd'),
                meal_type: mealType,
                recipe_id: recipeId,
                notes: notes || null,
            })

            if (apiError) {
                setError(apiError)
            } else {
                onMealAdded() // Callback to potentially show a success message or revalidate data
                onOpenChange(false)
                resetForm()
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setDate(new Date())
        setMealType('dinner')
        setNotes('')
        setError(null)
        setCalendarOpen(false)
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm() // Reset form when closing
        }
        onOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="shadow-md sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add '{recipeName}' to Meal Plan</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <div className="relative">
                            <Button
                                type="button"
                                variant={'outline'}
                                className={`w-full justify-start text-left font-normal border-gray-700 ${!date && 'text-muted-foreground'}`}
                                onClick={() => setCalendarOpen(!calendarOpen)}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, 'PPP') : <span>Pick a date</span>}
                            </Button>

                            {calendarOpen && (
                                <div
                                    ref={calendarRef}
                                    className="absolute left-0 top-[calc(100%+4px)] z-40 rounded-md border bg-popover p-3 shadow-md"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(newDate) => {
                                            setDate(newDate);
                                            setCalendarOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meal Type Select */}
                    <div className="space-y-2">
                        <Label htmlFor="mealType">Meal Type</Label>
                        <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
                            <SelectTrigger className="border-gray-700  ">
                                <SelectValue placeholder="Select meal type" />
                            </SelectTrigger>
                            <SelectContent className="border-gray-700  ">
                                {MEAL_TYPES.map((type) => (
                                    <SelectItem key={type} value={type} className="capitalize">
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="border-gray-700   min-h-[80px]"
                            placeholder="Add any notes for this meal..."
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">Error: {error}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !date}>
                        {submitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</>
                        ) : (
                            'Add to Meal Plan'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 