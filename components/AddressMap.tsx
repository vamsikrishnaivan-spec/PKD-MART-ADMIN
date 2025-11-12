"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, MapPin } from "lucide-react"

export function AddressMap({ lat, lng }: { lat: number; lng: number }) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded-md">
        Loading map...
      </div>
    )
  }

  return (
    <div className="w-full rounded-md border bg-gray-50 overflow-hidden">
      {/* Header with toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border-b text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span>View Location</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Map container */}
      {isOpen && (
        <div className="h-56 w-full transition-all duration-300 ease-in-out">
          <iframe
            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  )
}
