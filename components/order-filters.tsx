"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useState } from "react"

interface OrderFiltersProps {
  onFiltersChange: (filters: any) => void
}

export function OrderFilters({ onFiltersChange }: OrderFiltersProps) {
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    deliveryStatus: "",
  })

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === "all" ? "" : value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters = { status: "", paymentMethod: "", deliveryStatus: "" }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasFilters = Object.values(filters).some((value) => value !== "")

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select value={filters.status || "all"} onValueChange={(value) => updateFilter("status", value)}>
        <SelectTrigger className="w-[180px] border-gray-200">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PAID">Paid</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.paymentMethod || "all"} onValueChange={(value) => updateFilter("paymentMethod", value)}>
        <SelectTrigger className="w-[180px] border-gray-200">
          <SelectValue placeholder="Payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          <SelectItem value="PhonePe">PhonePe</SelectItem>
          <SelectItem value="COD">Cash on Delivery</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.deliveryStatus || "all"} onValueChange={(value) => updateFilter("deliveryStatus", value)}>
        <SelectTrigger className="w-[180px] border-gray-200">
          <SelectValue placeholder="Delivery status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Delivery Status</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="DISPATCHED">Dispatched</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="outline" onClick={clearFilters} className="bg-white border-gray-200 hover:bg-gray-50">
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
