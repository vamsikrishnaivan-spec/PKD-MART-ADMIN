"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import Link from "next/link"

interface Category {
  _id: string;
  name: string;
  slug: string;
}

async function createProduct(data: any) {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create product")
  }
  return response.json()
}

async function updateProduct(id: string, data: any) {
  const response = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update product")
  }
  return response.json()
}

interface ProductFormProps {
  mode?: "create" | "edit"
  initialData?: any
}

export function ProductForm({ mode = "create", initialData }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    upc: initialData?.upc || "",
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    category: initialData?.category || "",
    categoryId: initialData?.categoryId || "",
    subcategory: initialData?.subcategory || "",
    manufacturer: initialData?.manufacturer || "",
    model: initialData?.model || "",
    description: initialData?.description || "",
    mrp: initialData?.mrp?.toString() || "",
    sellingPrice: initialData?.sellingPrice?.toString() || "",
    costPrice: initialData?.costPrice?.toString() || "",
    currency: initialData?.currency || "INR",
    imageUrl: initialData?.imageUrl || "",
  })

  const [uploading, setUploading] = useState(false)
  const [loadingUPC, setLoadingUPC] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      mode === "create" ? createProduct(data) : updateProduct(initialData?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: `Product ${mode === "create" ? "created" : "updated"} successfully`,
      })
      if (mode === "create") {
        setFormData({
          upc: "",
          name: "",
          brand: "",
          category: "",
          categoryId: "",
          subcategory: "",
          manufacturer: "",
          model: "",
          description: "",
          mrp: "",
          sellingPrice: "",
          costPrice: "",
          currency: "INR",
          imageUrl: "",
        })
      } else {
        // For edit mode, redirect to products list
        router.push("/products")
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  // 🔍 Autofill from UPC API
  const handleAutofill = async () => {
    if (!formData.upc) {
      toast({ title: "Missing UPC", description: "Enter a UPC to autofill details.", variant: "destructive" })
      return
    }

    try {
      setLoadingUPC(true)
      const res = await fetch("/api/fetch-by-upc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upc: formData.upc }),
      })

      if (!res.ok) throw new Error("Failed to fetch UPC details")

      const data = await res.json()

      // Merge the fetched data with the existing form
      setFormData((prev) => ({
        ...prev,
        ...data,
        imageUrl: data.images?.[0] || prev.imageUrl,
        sellingPrice: data.pricing?.sellingPrice?.toString() || prev.sellingPrice,
        mrp: data.pricing?.mrp?.toString() || prev.mrp,
        currency: data.pricing?.currency || "INR",
      }))

      toast({ title: "Autofill successful", description: "Product details loaded from UPC." })
    } catch (error: any) {
      console.error(error)
      toast({ title: "Autofill failed", description: error.message, variant: "destructive" })
    } finally {
      setLoadingUPC(false)
    }
  }
  // 📸 Handle Image Upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      if (!res.ok) throw new Error("Image upload failed")
      const data = await res.json()

      setFormData((prev) => ({ ...prev, imageUrl: data.secure_url }))
      toast({ title: "Image uploaded", description: "Successfully uploaded to Cloudinary." })
    } catch (error: any) {
      console.error(error)
      toast({ title: "Upload failed", description: error.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      ...formData,
      mrp: Number(formData.mrp),
      sellingPrice: Number(formData.sellingPrice),
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryChange = (value: string) => {
    const selectedCategory = categories.find((cat) => cat._id === value);
    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        categoryId: selectedCategory._id,
        category: selectedCategory.name,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* UPC Autofill Section */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="upc">UPC <span style={{ color: "red" }}>*</span></Label>
          <Input
            id="upc"
            type="text"
            value={formData.upc}
            onChange={(e) => handleInputChange("upc", e.target.value)}
            placeholder="Enter UPC e.g. 8901287101010"
            required
          />
        </div>
        <Button type="button" onClick={handleAutofill} disabled={loadingUPC}>
          {loadingUPC ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Autofill"}
        </Button>
      </div>

      {/* Product Fields */}
      <div className="grid grid-cols-2  gap-4">
        <div>
          <Label>Name <span style={{ color: "red" }}>*</span></Label>
          <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
        </div>
        <div>
          <Label>Brand</Label>
          <Input value={formData.brand} onChange={(e) => handleInputChange("brand", e.target.value)} />
        </div>
        <div>
          <Label>Manufacturer</Label>
          <Input value={formData.manufacturer} onChange={(e) => handleInputChange("manufacturer", e.target.value)} />
        </div>
        <div>
          <Label>Model</Label>
          <Input value={formData.model} onChange={(e) => handleInputChange("model", e.target.value)} />
        </div>
        <div>
          <Label>Category <span style={{ color: "red" }}>*</span></Label>
          <div className="flex gap-2 items-center">
            <Select
              value={formData.categoryId || (categories.find(c => c.name === formData.category)?._id) || ""}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/categories/new" target="_blank">
              <Button type="button" variant="outline" size="icon" title="Add New Category">
                +
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <Label>Subcategory</Label>
          <Input value={formData.subcategory} onChange={(e) => handleInputChange("subcategory", e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Input value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} />
        </div>
        <div>
          <Label>MRP (₹)</Label>
          <Input
            type="number"
            value={formData.mrp}
            onChange={(e) => handleInputChange("mrp", e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
        <div>
          <Label>Selling Price (₹)<span style={{ color: "red" }}>*</span></Label>
          <Input
            type="number"
            value={formData.sellingPrice}
            onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
            placeholder="e.g. 80"
          />
        </div>
        <div>
          <Label>Cost Price (₹)</Label>
          <Input
            type="number"
            value={formData.costPrice}
            onChange={(e) => handleInputChange("costPrice", e.target.value)}
            placeholder="e.g. 80"
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Input value={formData.currency} readOnly />
        </div>
        <div className="col-span-2">
          <Label>Upload Image</Label>
          <div className="flex items-center gap-3">
            <Input type="file" accept="image/*" onChange={handleImageUpload} />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Product"
          ) : (
            "Update Product"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
