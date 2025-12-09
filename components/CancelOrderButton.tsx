"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { XCircle } from "lucide-react"

interface CancelOrderButtonProps {
    orderId: string
    deliveryStatus: string
}

export default function CancelOrderButton({
    orderId,
    deliveryStatus,
}: CancelOrderButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const queryClient = useQueryClient()

    // Don't show button if order is already delivered or cancelled
    if (deliveryStatus === "DELIVERED" || deliveryStatus === "CANCELLED") {
        return null
    }

    const handleCancel = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/orders/${orderId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })

            const data = await res.json()

            if (res.ok && data.success) {
                toast({
                    title: "Success",
                    description: "Order cancelled successfully.",
                })

                // Invalidate queries to refresh the order data
                queryClient.invalidateQueries({ queryKey: ["order", orderId] })
                queryClient.invalidateQueries({ queryKey: ["orders"] })

                setIsOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to cancel order",
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
        <>
            <Button
                variant="destructive"
                className="w-full"
                onClick={() => setIsOpen(true)}
            >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this order? This action will update the
                            delivery status to cancelled.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                        >
                            Close
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            {loading ? "Cancelling..." : "Confirm Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
