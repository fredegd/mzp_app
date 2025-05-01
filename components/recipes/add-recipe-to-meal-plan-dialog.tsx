'use client'

import { useState } from 'react'
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={`w-full justify-start text-left font-normal border-gray-700 text-white ${!date && 'text-muted-foreground'}`}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    className="bg-gray-900 border border-gray-700 rounded-md"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Meal Type Select */}
                    <div className="space-y-2">
                        <Label htmlFor="mealType">Meal Type</Label>
                        <Select value={mealType} onValueChange={(value) => setMealType(value as MealType)}>
                            <SelectTrigger className="border-gray-700 text-white">
                                <SelectValue placeholder="Select meal type" />
                            </SelectTrigger>
                            <SelectContent className="border-gray-700 text-white">
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
                            className="border-gray-700 text-white min-h-[80px]"
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