import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner"
import { QueryProvider } from "@/components/query-provider"
import PwaInstallButton from "@/components/PwaInstallButton"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin PKD Mart",
  description: "Professional PKD Mart Admin Dashboard for managing Users, Products, and Orders",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <QueryProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gray-50">
              <AppSidebar />
              <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
            </div>
            <PwaInstallButton />
            <Toaster
              position="top-right"
              richColors
              closeButton
            />
          </SidebarProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
