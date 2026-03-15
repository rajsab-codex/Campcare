"use client"

import type React from "react"
import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { useAuth } from "@/components/auth-provider"
import { ShieldAlert } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShieldAlert className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Prevent rendering while redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="lg:pl-64">{children}</main>
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  )
}
