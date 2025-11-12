"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, ShoppingCart, Calendar, MapPin } from "lucide-react"
import type { User as UserType } from "@/lib/types"
import { AddressMap } from "./AddressMap"

interface UsersListProps {
  users: UserType[]
  isLoading: boolean
  error: any
}

export function UsersList({ users, isLoading, error }: UsersListProps) {
  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Failed to load users. Please try again.</p>
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
                <div className="space-y-3">
                  <Skeleton className="h-24 w-3/4" />
                  <Skeleton className="h-24 w-1/2" />
                  <Skeleton className="h-24 w-1/4" />
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
                <TableHead className="font-semibold text-gray-700">User</TableHead>
                <TableHead className="font-semibold text-gray-700">Cart Items</TableHead>
                <TableHead className="font-semibold text-gray-700">Joined</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-gray-100">
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="h-12 w-12 mx-auto mb-4 text-gray-300"></div>
        <p className="text-lg font-medium">No users found</p>
        <p className="text-sm">Users will appear here once they register</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden space-y-3 p-4">
        {users.map((user) => (
          <Card key={user._id?.toString()} className="border border-gray-100 hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.email}</p>
                    <p className="text-xs text-gray-500">User ID: {user._id?.toString().slice(-8)}</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  <span>{user.cart?.length || 0} items in cart</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
              {user.addresses?.length > 0 ? (
  <div className="space-y-3 mt-3 text-xs text-gray-600">
    <div className="flex items-center gap-1 text-gray-700 font-medium">
      <MapPin className="h-3 w-3 text-blue-500" />
      <span>Addresses:</span>
    </div>

    {user.addresses.map((addr, idx) => (
      <div key={idx} className="border rounded-md p-3 bg-gray-50">
        <p className="text-gray-700 font-medium">{addr.label}</p>
        <p>{addr.formattedAddress}</p>

        <AddressMap lat={addr.lat} lng={addr.lng} />
      </div>
    ))}
  </div>
) : (
  <p className="text-xs text-gray-400 mt-2">No addresses available</p>
)}

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/50">
              <TableHead className="font-semibold text-gray-700">User</TableHead>
              <TableHead className="font-semibold text-gray-700">Cart Items</TableHead>
              <TableHead className="font-semibold text-gray-700">Joined</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id?.toString()} className="border-gray-100 hover:bg-gray-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">ID: {user._id?.toString().slice(-8)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="bg-purple-100 text-purple-800 flex items-center gap-1 p-2 rounded-lg">
                    <ShoppingCart className="h-3 w-3" />
                    {user.cart?.length || 0} items
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="bg-green-100 text-green-800 flex items-center gap-1 p-2 rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    Active
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
