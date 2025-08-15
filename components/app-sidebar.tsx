"use client"

import { BarChart3, Package, ShoppingCart, Users, Home, TrendingUp } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Overview & Analytics",
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    description: "View Only",
    badge: "Read Only",
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    description: "Full Management",
    badge: "CRUD",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    description: "View Only",
    badge: "Read Only",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-gray-200 bg-white shadow-sm">
      <SidebarHeader className="border-b border-gray-100 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">MongoDB Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="group relative rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:border-blue-200"
                  >
                    <Link href={item.url} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-data-[active=true]:text-blue-600" />
                        <div>
                          <div className="text-gray-700 group-data-[active=true]:text-blue-700">{item.title}</div>
                          <div className="text-xs text-gray-400 group-data-[active=true]:text-blue-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      {item.badge && (
                        <Badge variant={item.badge === "CRUD" ? "default" : "secondary"} className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span>Real-time updates enabled</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
