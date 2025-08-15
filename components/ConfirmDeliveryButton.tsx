"use client"

import { Button } from "@/components/ui/button"

export default function ConfirmDeliveryButton({ orderId, deliveryStatus }: { orderId: string, deliveryStatus: string }) {
  if (deliveryStatus === "DELIVERED") return null

  const handleClick = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus: "DELIVERED" }),
      })

      if (res.ok) {
        alert("Order marked as delivered!")
        location.reload()
      } else {
        const data = await res.json()
        alert(`Failed to update: ${data.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong!")
    }
  }

  return (
    <Button
      className="w-full bg-green-600 hover:bg-green-700 text-white"
      onClick={handleClick}
    >
      Confirm Delivery
    </Button>
  )
}
