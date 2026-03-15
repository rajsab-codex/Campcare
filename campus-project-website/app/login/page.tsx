"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import { validateUserInput } from "@/lib/auth"
import { ShieldAlert, AlertCircle, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"student" | "faculty" | "superadmin">("student")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const validation = validateUserInput(name, id, email, role)
    if (validation) {
      setError(validation)
      setIsSubmitting(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        id,
        name,
        email,
        role,
      })

      if (result?.error) {
        setError("Invalid credentials. Please try again.")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShieldAlert className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <ShieldAlert className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">CampCare</span>
        </div>
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-muted-foreground">
          Login to access your campus services
        </p>
      </div>

      {/* Card */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Who is logging in?</CardTitle>
          <CardDescription>Enter your details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              placeholder={role === "student" ? "Student ID" : "Faculty ID / Employee ID"}
              value={id}
              onChange={(e) => setId(e.target.value)}
            />

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as "student" | "faculty" | "superadmin")}
              className="flex gap-4"
            >
              <Label className="flex items-center gap-2">
                <RadioGroupItem value="student" />
                Student
              </Label>

              <Label className="flex items-center gap-2">
                <RadioGroupItem value="faculty" />
                Faculty
              </Label>
            </RadioGroup>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>
    </div>
  )
}
