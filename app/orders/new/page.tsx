import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { OrderForm } from "@/components/order-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewOrderPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <SidebarTrigger className="md:hidden self-start" />
        <Button variant="outline" size="sm" asChild className="w-fit bg-transparent">
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Create New Order</h1>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm />
        </CardContent>
      </Card>
    </div>
  )
}
