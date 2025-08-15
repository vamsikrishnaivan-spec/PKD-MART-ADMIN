"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

const categories = [
  { value: "vegetables", label: "Vegetables" },
  { value: "fruits", label: "Fruits" },
  { value: "dairy", label: "Dairy" },
  { value: "essentials", label: "Essentials" },
  { value: "snacks", label: "Snacks" },
  { value: "instant-food", label: "Instant Food" },
]

async function createProduct(data: any) {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create product")
  }
  return response.json()
}

export function ProductForm() {
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    imageUrl: "",
    category: "",
  })
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: "Product created successfully",
      })
      router.push("/products")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      price: Number.parseFloat(formData.price),
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="productName" className="text-sm font-medium text-gray-700">
            Product Name *
          </Label>
          <Input
            id="productName"
            type="text"
            value={formData.productName}
            onChange={(e) => handleInputChange("productName", e.target.value)}
            placeholder="Enter product name"
            required
            className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="price" className="text-sm font-medium text-gray-700">
            Price (₹) *
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0.00"
            required
            className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
            Image URL *
          </Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange("imageUrl", e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
            className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-gray-700">
            Category *
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Product"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/products")} className="bg-white">
          Cancel
        </Button>
      </div>
    </form>
  )
}
