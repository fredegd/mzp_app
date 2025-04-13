"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
import {
  getShoppingList,
  createShoppingListItem,
  toggleShoppingListItem,
  deleteShoppingListItem,
  generateShoppingList,
} from "@/lib/meal-planner"
import { formatDate } from "@/lib/utils/date"
import type { ShoppingListItem } from "@/types/meal-planner"
import GenerateShoppingListDialog from "./generate-shopping-list-dialog"

export default function ShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)

  useEffect(() => {
    fetchShoppingList()
  }, [])

  const fetchShoppingList = async () => {
    setLoading(true)
    try {
      const { items: data, error } = await getShoppingList()

      if (error) {
        console.error("Error fetching shopping list:", error)
      } else if (data) {
        setItems(data)
      }
    } catch (error) {
      console.error("Error fetching shopping list:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newItem.trim()) return

    setAddingItem(true)
    try {
      await createShoppingListItem({ item: newItem.trim() })
      setNewItem("")
      fetchShoppingList()
    } catch (error) {
      console.error("Error adding item:", error)
    } finally {
      setAddingItem(false)
    }
  }

  const handleToggleItem = async (id: string, checked: boolean) => {
    try {
      await toggleShoppingListItem(id, checked)
      setItems(items.map((item) => (item.id === id ? { ...item, checked } : item)))
    } catch (error) {
      console.error("Error toggling item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteShoppingListItem(id)
      setItems(items.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleGenerateList = async (startDate: Date, endDate: Date) => {
    try {
      const startDateStr = formatDate(startDate)
      const endDateStr = formatDate(endDate)

      const { success, itemCount, error } = await generateShoppingList(startDateStr, endDateStr)

      if (success) {
        fetchShoppingList()
        return { success: true, message: `Generated shopping list with ${itemCount} items` }
      } else {
        return { success: false, message: error || "Failed to generate shopping list" }
      }
    } catch (error: any) {
      console.error("Error generating shopping list:", error)
      return { success: false, message: error.message || "An error occurred" }
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    // Sort by checked status first
    if (a.checked !== b.checked) {
      return a.checked ? 1 : -1
    }
    // Then by name
    return a.item.localeCompare(b.item)
  })

  return (
    <div className="space-y-4">
      <Card className="bg-[#1c1c1c] border-gray-800 text-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Shopping List</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGenerateDialogOpen(true)}
            className="text-[#2b725e] border-[#2b725e]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate from Meal Plan
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex space-x-2 mb-4">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an item..."
              className="bg-[#252525] border-gray-700 text-white"
            />
            <Button
              type="submit"
              disabled={addingItem || !newItem.trim()}
              className="bg-[#2b725e] hover:bg-[#235e4c] text-white"
            >
              {addingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </form>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : sortedItems.length > 0 ? (
            <div className="space-y-2">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-md bg-[#252525] border border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.checked}
                      onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                    />
                    <Label
                      htmlFor={`item-${item.id}`}
                      className={`${item.checked ? "line-through text-gray-500" : "text-white"}`}
                    >
                      {item.quantity && item.unit ? `${item.quantity} ${item.unit} ${item.item}` : item.item}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(item.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Your shopping list is empty</div>
          )}
        </CardContent>
      </Card>

      <GenerateShoppingListDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onGenerate={handleGenerateList}
      />
    </div>
  )
}
