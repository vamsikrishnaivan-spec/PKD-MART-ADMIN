import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ProductForm } from "@/components/product-form"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewProductPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <SidebarTrigger className="md:hidden self-start" />
        <Button variant="outline" size="sm" asChild className="w-fit bg-white border-gray-200 hover:bg-gray-50">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">Create a new product for your catalog</p>
        </div>
      </div>

      <Card className="max-w-2xl border-0 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Package className="h-5 w-5" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  )
}
