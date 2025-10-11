"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, DollarSign, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Product } from "@/lib/types"

interface ProductsListProps {
  products: Product[]
  isLoading: boolean
  error: any
}

const categoryColors = {
  vegetables: "bg-green-100 text-green-800",
  fruits: "bg-orange-100 text-orange-800",
  dairy: "bg-blue-100 text-blue-800",
  essentials: "bg-purple-100 text-purple-800",
  snacks: "bg-yellow-100 text-yellow-800",
  "instant-food": "bg-red-100 text-red-800",
}

async function deleteProduct(id: string) {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Failed to delete product")
  }
  return response.json()
}

export function ProductsList({ products, isLoading, error }: ProductsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    },
    onSettled: () => {
      setDeletingId(null)
    },
  })

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteMutation.mutate(id)
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Failed to load products. Please try again.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="block md:hidden space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border border-gray-100">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Loading */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="font-semibold text-gray-700">Product</TableHead>
                <TableHead className="font-semibold text-gray-700">Price</TableHead>
                <TableHead className="font-semibold text-gray-700">Category</TableHead>
                <TableHead className="font-semibold text-gray-700">Created</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-100">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm mb-4">Start by adding your first product</p>
        <Button asChild>
          <Link href="/products/new">Add Product</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden space-y-3 p-4">
        {products.map((product) => (
          <Card key={product._id?.toString()} className="border border-gray-100 hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-3">
                <Image
                  src={product.imageUrl || "/placeholder.svg?height=64&width=64"}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {/* <DollarSign className="h-4 w-4 text-green-600" /> */}
                    <span className="text-lg font-bold text-green-600">₹{product.sellingPrice}</span>
                  </div>
                  <Badge className={`${categoryColors[product.category]} text-xs mt-2`}>{product.category}</Badge>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Created: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 bg-transparent border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Link href={`/products/${product._id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent border-red-200 text-red-700 hover:bg-red-50"
                      disabled={deletingId === product._id?.toString()}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deletingId === product._id?.toString() ? "Deleting..." : "Delete"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(product._id?.toString() || "")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">Product</TableHead>
              <TableHead className="font-semibold text-gray-700">Price</TableHead>
              <TableHead className="font-semibold text-gray-700">Category</TableHead>
              <TableHead className="font-semibold text-gray-700">Created</TableHead>
              <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id?.toString()} className="border-gray-100 hover:bg-gray-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.imageUrl || "/placeholder.svg?height=48&width=48"}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">ID: {product._id?.toString().slice(-8)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-green-600">₹{product.sellingPrice}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={categoryColors[product.category]}>{product.category}</Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    >
                      <Link href={`/products/${product._id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                          disabled={deletingId === product._id?.toString()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product._id?.toString() || "")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
