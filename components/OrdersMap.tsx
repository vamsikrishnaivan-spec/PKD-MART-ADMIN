'use client'

import { useState, useCallback, useEffect } from 'react'
import { GoogleMap, OverlayView, useJsApiLoader } from '@react-google-maps/api'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeliveryAddress {
  lat: number
  lng: number
  formattedAddress: string
}

interface CartItem {
  name: string
  quantity: number
  price: number
  productId:{
    name: string
    sellingPrice: number
    imageUrl: string
  }
}

interface Order {
  _id: string
  name: string
  mobile: string
  totalAmount: number
  deliveryAddress: DeliveryAddress
  items: CartItem[]
}

export default function OrdersMap({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationOverlayVisible, setLocationOverlayVisible] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    orders.length
      ? { lat: orders[0].deliveryAddress.lat, lng: orders[0].deliveryAddress.lng }
      : { lat: 20.5937, lng: 78.9629 }
  )

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  // Request user location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(loc)
        setCenter(loc) // center map
        setLocationOverlayVisible(false)
        setLocationError(null)

        if (mapInstance) {
          mapInstance.panTo(loc)
          mapInstance.setZoom(14)
        }
      },
      error => {
        console.warn('Location error', error)
        setLocationError('Please allow location for accurate tracking.')
        setLocationOverlayVisible(true)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMapInstance(map)
      const bounds = new window.google.maps.LatLngBounds()
      orders.forEach(order => bounds.extend({ lat: order.deliveryAddress.lat, lng: order.deliveryAddress.lng }))
      if (userLocation) bounds.extend(userLocation)
      map.fitBounds(bounds)
    },
    [orders, userLocation]
  )

  useEffect(() => {
    if (userLocation && mapInstance) {
      mapInstance.panTo(userLocation)
      mapInstance.setZoom(20)
    }
  }, [userLocation, mapInstance])

  if (!isLoaded) return <div>Loading map...</div>

  return (
    <div className="w-full h-[80vh] relative rounded-lg overflow-hidden shadow-lg border">
      {/* Location overlay */}
      {locationOverlayVisible && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4 max-w-xs text-center">
            <p className="text-lg font-semibold">Please enable location for accurate tracking.</p>
            {locationError && <p className="text-red-500 text-sm">{locationError}</p>}
            <Button
              onClick={requestLocation}
              className="bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-full shadow-lg text-lg"
            >
              Allow Location
            </Button>
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={userLocation ? 24 : 24}
        onLoad={onLoad}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        }}
      >
        {/* Orders markers */}
        {orders.map(order => (
         <OverlayView
         key={order._id}
         position={{ lat: order.deliveryAddress.lat, lng: order.deliveryAddress.lng }}
         mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
       >
         <div
           onClick={() => setSelectedOrder(order)}
           className="relative flex flex-col items-center cursor-pointer group"
         >
           {/* Bubble */}
           <div className="bg-indigo-600 rounded-lg shadow-lg border border-indigo-400 p-2 flex flex-col items-center transition-transform duration-200 group-hover:scale-110">
             <div className="text-white text-sm font-bold">₹{order.totalAmount}</div>
             <div className="text-white text-xs">{order.name}</div>
           </div>
       
           {/* Tail */}
           <div className="w-0 h-0 border-l-3 border-r-3 border-t-4 border-l-transparent border-r-transparent border-t-indigo-600" />
       
           {/* Pulse */}
           <span className="absolute -bottom-3 w-4 h-4 bg-indigo-500 rounded-full opacity-30 animate-ping" />
         </div>
       </OverlayView>
       
       
       
        ))}

        {/* User location */}
        {userLocation && (
          <OverlayView
            position={userLocation}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-green-600 text-white font-bold flex items-center justify-center shadow-2xl border-2 border-white animate-pulse text-lg">
                You
              </div>
              <div className="w-0 h-0 border-l-10 border-r-10 border-t-14 border-l-transparent border-r-transparent border-t-blue-600"></div>
            </div>
          </OverlayView>
        )}
      </GoogleMap>

      {/* Radix Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl w-96 shadow-2xl">
          {selectedOrder && (
            <>
              <DialogTitle className="text-lg font-bold mb-2">Order Details</DialogTitle>
              <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
                <p><strong>User:</strong> {selectedOrder.name}</p>
                <p><strong>Mobile:</strong> {selectedOrder.mobile}</p>
                <p><strong>Amount:</strong> ₹{selectedOrder.totalAmount}</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress.formattedAddress}</p>
                {selectedOrder.items && selectedOrder.items.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold mb-1">Cart Items:</p>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-2">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm border-b last:border-b-0 pb-1">
                  {/* Image */}
                  <img
                    src={item.productId.imageUrl || "/assets/comingsoon.webp"}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded mr-2"
                  />
                  {/* Name & Quantity */}
                  <div className="flex-1">
                    <div className="font-medium">{item.productId.name}</div>
                    <div className="text-gray-500 text-xs">Qty: {item.quantity}</div>
                  </div>
                  {/* Price */}
                  <div className="font-semibold">₹{item.productId.sellingPrice * item.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        )}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                <Button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${selectedOrder.deliveryAddress.lat},${selectedOrder.deliveryAddress.lng}`,
                      '_blank'
                    )
                  }
                >
                  Go to Location
                </Button>
                <Button onClick={() => router.push(`/orders/${selectedOrder._id}`)}>View Details</Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
