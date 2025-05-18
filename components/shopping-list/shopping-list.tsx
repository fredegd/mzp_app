"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
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

const MANUAL_ITEMS_GROUP = "Manually Added"

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
        setItems([])
      } else if (data) {
        setItems(data)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error("Error fetching shopping list:", error)
      setItems([])
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
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, checked } : item))
      )
    } catch (error) {
      console.error("Error toggling item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    const originalItems = items
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    try {
      await deleteShoppingListItem(id)
    } catch (error) {
      console.error("Error deleting item:", error)
      setItems(originalItems)
    }
  }

  const handleGenerateList = async (startDate: Date, endDate: Date) => {
    setLoading(true)
    try {
      const startDateStr = formatDate(startDate)
      const endDateStr = formatDate(endDate)
      const { success, itemCount, error } = await generateShoppingList(startDateStr, endDateStr)
      if (success) {
        await fetchShoppingList()
        return { success: true, message: `Generated shopping list with ${itemCount} items` }
      } else {
        setLoading(false)
        return { success: false, message: error || "Failed to generate shopping list" }
      }
    } catch (error: any) {
      console.error("Error generating shopping list:", error)
      setLoading(false)
      return { success: false, message: error.message || "An error occurred" }
    }
  }

  const groupedItems = useMemo(() => {
    const grouped: { [key: string]: ShoppingListItem[] } = {}

    items.forEach((item) => {
      const groupName = item.recipe?.name || MANUAL_ITEMS_GROUP
      if (!grouped[groupName]) {
        grouped[groupName] = []
      }
      grouped[groupName].push(item)
    })

    for (const groupName in grouped) {
      grouped[groupName].sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1
        }
        return a.item.localeCompare(b.item)
      })
    }

    return grouped
  }, [items])

  const sortedGroupNames = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => {
      if (a === MANUAL_ITEMS_GROUP) return 1
      if (b === MANUAL_ITEMS_GROUP) return -1
      return a.localeCompare(b)
    })
  }, [groupedItems])

  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Shopping List</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGenerateDialogOpen(true)}
            disabled={loading}
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
              disabled={addingItem || loading}
              className=" border-gray-700"
            />
            <Button
              type="submit"
              disabled={addingItem || !newItem.trim() || loading}
              className="bg-[#2b725e] hover:bg-[#235e4c]"
            >
              {addingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </form>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Your shopping list is empty</div>
          ) : (
            <div className="space-y-6">
              {sortedGroupNames.map((groupName) => (
                <div key={groupName}>
                  <h3 className="text-lg font-semibold mb-2  border-b border-gray-600 pb-1">
                    {groupName}
                  </h3>
                  <div className="space-y-2">
                    {groupedItems[groupName].map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-md border border-gray-700 hover:bg-gray-800 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.checked}
                            onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                            aria-label={`Mark ${item.item} as ${item.checked ? 'not bought' : 'bought'}`}
                          />
                          <Label
                            htmlFor={`item-${item.id}`}
                            className={`${item.checked && "line-through text-gray-500"} truncate`}
                          >
                            {item.quantity && item.unit ? `${item.quantity} ${item.unit} ${item.item}` : item.item}
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-400 flex-shrink-0"
                          aria-label={`Delete ${item.item}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
