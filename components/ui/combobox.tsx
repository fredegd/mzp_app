"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    options: { label: string; value: string }[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyPlaceholder?: string
    className?: string
    disabled?: boolean // Added disabled prop
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search options...",
    emptyPlaceholder = "No option found.",
    className,
    disabled = false, // Default disabled to false
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const selectedOption = options.find((option) => option.value === value)

    // Custom filter function to search by label
    const filter = (value: string, search: string) => {
        // 'value' here is the CommandItem's value prop (option.value)
        // We need to find the corresponding option to check its label.
        const option = options.find(opt => opt.value === value)
        if (option?.label.toLowerCase().includes(search.toLowerCase())) {
            return 1 // Match found
        }
        return 0 // No match
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)} // Ensure button takes full width if needed
                    disabled={disabled} // Apply disabled prop
                >
                    {selectedOption ? selectedOption.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                <Command filter={filter}>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value} // Use value for CommandItem's value
                                    onSelect={(currentValue) => {
                                        // currentValue is the value of the selected item (option.value)
                                        // Find the corresponding option to potentially get the label if needed elsewhere
                                        const selectedVal = options.find(opt => opt.value.toLowerCase() === currentValue.toLowerCase())?.value || ""
                                        onChange(selectedVal === value ? "" : selectedVal) // Allow unselecting
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
} 