"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, CheckCircle, ShieldX } from "lucide-react"
import Link from "next/link"
import { saveComplaint } from "@/lib/storage"
import type { Complaint, ComplaintCategory, ComplaintPriority } from "@/lib/data"
import { useAuth } from "@/components/auth-provider"
import { canSubmitComplaints } from "@/lib/permissions"
import { addNotification } from "@/lib/notifications"

const categories = [
  { value: "infrastructure", label: "Infrastructure", description: "Buildings, facilities, equipment" },
  { value: "academic", label: "Academic", description: "Courses, exams, faculty" },
  { value: "hostel", label: "Hostel", description: "Room, mess, amenities" },
  { value: "canteen", label: "Canteen", description: "Food quality, hygiene, service" },
  { value: "transport", label: "Transport", description: "Bus routes, timing, condition" },
  { value: "other", label: "Other", description: "Other campus issues" },
]

const priorities = [
  { value: "low", label: "Low", description: "Minor issue, can wait" },
  { value: "medium", label: "Medium", description: "Important issue, needs attention soon" },
  { value: "high", label: "High", description: "Urgent issue, needs immediate attention" },
  { value: "critical", label: "Critical", description: "Emergency, requires immediate action" },
]

export default function NewComplaintPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "",
    description: "",
    image: null as File | null,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: null })
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority || "medium",
          createdBy: "STU2024001",
        }),
      })

      if (response.ok) {
        const complaintId = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newComplaint: Complaint = {
          id: complaintId,
          title: formData.title,
          description: formData.description,
          category: formData.category as ComplaintCategory,
          status: "pending",
          priority: (formData.priority || "medium") as ComplaintPriority,
          imageUrl: imagePreview || undefined,
          studentName: "Current User",
          studentId: "STU2024001",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        saveComplaint(newComplaint)
        // Add notification for new complaint submission
        addNotification({
          type: "complaint-update",
          title: "Complaint Submitted",
          message: `Your complaint "${formData.title}" has been submitted successfully.`,
          complaintId: complaintId,
          read: false,
        })
      }
    } catch (error) {
      console.error("Error saving complaint to MongoDB:", error)
      const complaintId = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newComplaint: Complaint = {
        id: complaintId,
        title: formData.title,
        description: formData.description,
        category: formData.category as ComplaintCategory,
        status: "pending",
        priority: (formData.priority || "medium") as ComplaintPriority,
        imageUrl: imagePreview || undefined,
        studentName: "Current User",
        studentId: "STU2024001",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveComplaint(newComplaint)
      // Add notification for new complaint submission
      addNotification({
        type: "complaint-update",
        title: "Complaint Submitted",
        message: `Your complaint "${formData.title}" has been submitted successfully.`,
        complaintId: complaintId,
        read: false,
      })
    }

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Complaint Submitted" />
        <div className="p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="bg-card border-border max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Complaint Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your complaint has been successfully submitted. You can track its status from the complaints page.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Complaint ID: <span className="font-mono text-primary">CMP-{Date.now().toString().slice(-6)}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard/complaints" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Complaints
                  </Button>
                </Link>
                <Button onClick={() => setIsSubmitted(false)} className="flex-1">
                  Submit Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="File a Complaint" description="Submit a new complaint about campus issues" />

      <div className="p-6">

        <Card className="bg-card border-border max-w-2xl">
          <CardHeader>
            <CardTitle>New Complaint</CardTitle>
            <CardDescription>
              Provide details about the issue you want to report. Our team will review and address it promptly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Complaint Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title describing the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                          <span className="text-xs text-muted-foreground">{cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  required
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex flex-col">
                          <span>{p.label}</span>
                          <span className="text-xs text-muted-foreground">{p.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue, including location and any relevant context..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                  className="bg-secondary border-border resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Attach Image (Optional)</Label>
                {imagePreview ? (
                  <div className="relative w-full max-w-sm">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard/complaints">
                  <Button type="button" variant="outline" className="bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.category || !formData.priority || !formData.description}
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
