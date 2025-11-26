import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "sonner"
import { QueryProvider } from "@/components/query-provider"
import PwaInstallButton from "@/components/PwaInstallButton"
import { ClientProviders } from "@/components/ClientProviders"
import SWRegister from "@/components/sw-register"

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/pkdmart-192.png" />
        <link rel="apple-touch-icon" href="/PKDMart.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} h-full bg-gray-50`}>
        <ClientProviders>
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
        </ClientProviders>
        <SWRegister />
      </body>
    </html>
  )
}
