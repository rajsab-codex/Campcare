"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Upload, X, CheckCircle, AlertTriangle, Package, MapPin } from "lucide-react"
import Link from "next/link"
import { saveLostFoundItem } from "@/lib/storage"
import type { LostFoundItem, ItemType } from "@/lib/data"
import { useAuth } from "@/components/auth-provider"
import { canAddLostFound } from "@/lib/permissions"
import { getUserId } from "@/lib/auth"
import { addNotification } from "@/lib/notifications"
import MapPicker from "@/components/map-picker"

const categories = ["Electronics", "Bags", "Documents", "Accessories", "Books", "Clothing", "Others"]

export default function NewLostFoundPage() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; label: string } | null>(null)

  // Check if user can add items
  const canPost = user ? canAddLostFound(user) : false

  // Redirect if user cannot post
  useEffect(() => {
    if (user && !canPost) {
      window.location.href = "/dashboard/lost-found"
    }
  }, [user, canPost])

  const [formData, setFormData] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
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
    if (!user) return

    setIsSubmitting(true)

    try {
      // Save to MongoDB via API
      const response = await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          itemName: formData.title,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          date: formData.date,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          imageUrl: imagePreview || "",
          createdBy: getUserId(user) || user.name,
        }),
      })

      let data = null
      if (response.ok) {
        data = await response.json()
      }

      if (!response.ok) {
        throw new Error("Failed to create item")
      }

      // Add notification for lost/found item posting
      const itemId = data?._id || `lf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      addNotification({
        type: "lost-found-match",
        title: formData.type === "lost" ? "Lost Item Reported" : "Found Item Posted",
        message: `Your ${formData.type === "lost" ? "lost" : "found"} item "${formData.title}" has been posted successfully.`,
        lostFoundId: itemId,
        read: false,
      })

      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error creating lost & found item:", error)
      setIsSubmitting(false)
      // Fallback to localStorage if API fails
      const itemId = `lf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newItem: LostFoundItem = {
        id: itemId,
        type: formData.type as ItemType,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date: formData.date,
        imageUrl: imagePreview || undefined,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        createdAt: new Date().toISOString(),
        createdBy: getUserId(user) || user.name,
        status: "active",
      }
      saveLostFoundItem(newItem)

      // Add notification for lost/found item posting
      addNotification({
        type: "lost-found-match",
        title: formData.type === "lost" ? "Lost Item Reported" : "Found Item Posted",
        message: `Your ${formData.type === "lost" ? "lost" : "found"} item "${formData.title}" has been posted successfully.`,
        lostFoundId: itemId,
        read: false,
      })

      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Item Posted" />
        <div className="p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="bg-card border-border max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-6 ${
                  formData.type === "lost" ? "bg-destructive/20" : "bg-success/20"
                }`}
              >
                {formData.type === "lost" ? (
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-success" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {formData.type === "lost" ? "Lost Item Reported!" : "Found Item Posted!"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {formData.type === "lost"
                  ? "Your lost item has been posted. You'll be notified if someone finds it."
                  : "Thank you for posting the found item. The owner can now contact you."}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Item ID: <span className="font-mono text-primary">LF-{Date.now().toString().slice(-6)}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard/lost-found" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Items
                  </Button>
                </Link>
                <Button onClick={() => setIsSubmitted(false)} className="flex-1">
                  Post Another
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
      <DashboardHeader title="Post Lost/Found Item" description="Report a lost item or post a found item" />

      <div className="p-6">
        <Link
          href="/dashboard/lost-found"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lost & Found
        </Link>

        <Card className="bg-card border-border max-w-2xl">
          <CardHeader>
            <CardTitle>Post Item</CardTitle>
            <CardDescription>Provide details about the lost or found item to help with identification.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Type */}
              <div className="space-y-3">
                <Label>Item Type *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as "lost" | "found" })}
                  className="flex gap-4"
                >
                  <div className="flex-1">
                    <RadioGroupItem value="lost" id="lost" className="peer sr-only" />
                    <Label
                      htmlFor="lost"
                      className="flex flex-col items-center gap-2 rounded-lg border-2 border-border bg-secondary p-4 cursor-pointer peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 transition-colors"
                    >
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                      <span className="font-medium">Lost Item</span>
                      <span className="text-xs text-muted-foreground text-center">Report something you lost</span>
                    </Label>
                  </div>
                  <div className="flex-1">
                    <RadioGroupItem value="found" id="found" className="peer sr-only" />
                    <Label
                      htmlFor="found"
                      className="flex flex-col items-center gap-2 rounded-lg border-2 border-border bg-secondary p-4 cursor-pointer peer-data-[state=checked]:border-success peer-data-[state=checked]:bg-success/10 transition-colors"
                    >
                      <Package className="h-6 w-6 text-success" />
                      <span className="font-medium">Found Item</span>
                      <span className="text-xs text-muted-foreground text-center">Post something you found</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Item Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Name *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Blue Laptop Bag"
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
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item in detail - color, brand, distinguishing features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="bg-secondary border-border resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    {formData.type === "lost" ? "Last Seen Location" : "Found Location"} *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder="e.g., Central Library, 2nd Floor"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      className="bg-secondary border-border flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMapPicker(true)}
                      className="bg-secondary border-border shrink-0"
                      title="Pick location on map"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  {selectedLocation && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedLocation.label} ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">{formData.type === "lost" ? "Date Lost" : "Date Found"} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Item Image (Optional)</Label>
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
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Contact Information</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Your name"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      required
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard/lost-found">
                  <Button type="button" variant="outline" className="bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.title ||
                    !formData.category ||
                    !formData.description ||
                    !formData.location ||
                    !formData.date ||
                    !formData.contactName ||
                    !formData.contactEmail ||
                    !formData.contactPhone
                  }
                  className={formData.type === "lost" ? "" : "bg-success hover:bg-success/90 text-success-foreground"}
                >
                  {isSubmitting ? "Posting..." : `Post ${formData.type === "lost" ? "Lost" : "Found"} Item`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          initialLat={selectedLocation?.lat || 15.2993}
          initialLng={selectedLocation?.lng || 74.1240}
          onClose={() => setShowMapPicker(false)}
          onConfirm={(lat, lng, label) => {
            setSelectedLocation({ lat, lng, label })
            setFormData({ ...formData, location: label })
            setShowMapPicker(false)
          }}
        />
      )}
    </div>
  )
}
