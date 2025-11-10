"use client"

import { useState } from "react"
import { Button, } from "@/components/ui/button" // replace Input with your input component if different
import { useToast } from "@/hooks/use-toast"

export default function ConfirmDeliveryWithOtp({ orderId, deliveryStatus }: { orderId: string, deliveryStatus: string }) {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
    const { toast } = useToast()

  if (deliveryStatus === "DELIVERED") return null

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description:
          `Failed: "Please enter OTP"`,
        variant: "destructive",
      });
    }
    

    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, otp }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Success",
          description: "OTP verified! Order marked as delivered.",
        })
        location.reload()
      } else {
        toast({
          title: "Error",
          description: `Failed: ${data.message || "Invalid OTP"}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Something went wrong!",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="border p-2 rounded text-center text-lg"
      />
      <Button
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        onClick={handleVerifyOtp}
        disabled={loading}
      >
        {loading ? "Verifying..." : "Confirm Delivery"}
      </Button>
    </div>
  )
}
