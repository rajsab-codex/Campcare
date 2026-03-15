"use client"

import { SessionProvider, useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as User | null
  const isLoading = status === "loading"

  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return { user, isLoading, logout }
}
