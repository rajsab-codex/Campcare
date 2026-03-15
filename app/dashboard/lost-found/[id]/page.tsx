"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockLostFoundItems } from "@/lib/data"
import { getStoredLostFoundItems } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import { getUserId } from "@/lib/auth"
import { ArrowLeft, MapPin, Calendar, Mail, Phone, User, Package, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function LostFoundDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [canMarkAsFound, setCanMarkAsFound] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const loadItem = async () => {
      const id = params.id as string
      try {
        const response = await fetch(`/api/lost-found/${id}`)
        if (response.ok) {
          const data = await response.json()
          setItem({
            _id: data._id,
            id: data._id,
            type: data.type,
            title: data.itemName,
            description: data.description,
            location: data.location,
            status: data.status,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            imageUrl: data.imageUrl,
            contactName: data.contactName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            category: data.category,
            date: data.date,
          })
          // Check if current user is the owner (original poster) or superadmin
          if (user) {
            const currentUserId = getUserId(user)
            const isOwner = currentUserId === data.createdBy || (user.name === data.createdBy) || currentUserId === "2305029"
            setCanMarkAsFound(isOwner && data.status === "open")
          }
        } else {
          const allItems = [...mockLostFoundItems, ...getStoredLostFoundItems()]
          const foundItem = allItems.find((i) => i.id === id)
          if (foundItem) {
            setItem(foundItem)
            // Check if current user is the owner (original poster) or superadmin
            if (user) {
              const currentUserId = getUserId(user)
              const isOwner = currentUserId === foundItem.createdBy || (user.name === foundItem.createdBy) || currentUserId === "2305029"
              setCanMarkAsFound(isOwner && foundItem.status === "active")
            }
          } else {
            notFound()
          }
        }
      } catch (error) {
        console.error("Error fetching item:", error)
        const allItems = [...mockLostFoundItems, ...getStoredLostFoundItems()]
        const foundItem = allItems.find((i) => i.id === id)
        if (foundItem) {
          setItem(foundItem)
          // Check if current user is the owner (original poster) or superadmin
          if (user) {
            const currentUserId = getUserId(user)
            const isOwner = currentUserId === foundItem.createdBy || (user.name === foundItem.createdBy) || currentUserId === "2305029"
            setCanMarkAsFound(isOwner && foundItem.status === "active")
          }
        } else {
          notFound()
        }
      }
      setIsLoading(false)
    }
    if (params.id) {
      loadItem()
    }
  }, [params.id, user])

  const handleMarkAsFound = async () => {
    if (!item || !user || !canMarkAsFound) return
    setIsUpdating(true)
    try {
      const userId = getUserId(user) || user.name
      const response = await fetch(`/api/lost-found/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed", userId }),
      })
      if (response.ok) {
        setItem({ ...item, status: "closed" })
        setCanMarkAsFound(false)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to mark as found")
      }
    } catch (error) {
      console.error("Error marking as found:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Item Details" />
        <div className="p-6 text-center">Loading...</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Item Details" />
        <div className="p-6">
          <Link href="/dashboard/lost-found" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lost & Found
          </Link>
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Item not found</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Item Details" />
      <div className="p-6">
        <Link href="/dashboard/lost-found" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lost & Found
        </Link>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border overflow-hidden">
              <div className="aspect-video bg-secondary relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground/30" />
                  </div>
                )}
                <Badge className={`absolute top-4 left-4 text-sm ${item.type === "lost" ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}`}>
                  {item.type === "lost" ? <><AlertTriangle className="h-4 w-4 mr-1" /> Lost Item</> : <><CheckCircle className="h-4 w-4 mr-1" /> Found Item</>}
                </Badge>
              </div>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  {item.category && <Badge variant="outline" className="bg-transparent">{item.category}</Badge>}
                  {(item.status === "closed" || item.status === "resolved") && (
                    <Badge className="bg-primary text-primary-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {item.status === "closed" ? "Closed" : "Resolved"}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.type === "lost" ? "Last Seen Location" : "Found Location"}</p>
                      <p className="font-medium text-foreground">{item.location}</p>
                    </div>
                  </div>
                  {item.date && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{item.type === "lost" ? "Date Lost" : "Date Found"}</p>
                        <p className="font-medium text-foreground">{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                    </div>
                  )}
                </div>
                {canMarkAsFound && (
                  <div className="pt-4">
                    <Button 
                      onClick={handleMarkAsFound} 
                      disabled={isUpdating} 
                      className="w-full"
                      variant={item.type === "lost" ? "default" : "default"}
                    >
                      {isUpdating 
                        ? (item.type === "lost" ? "Marking as Recovered..." : "Marking as Claimed...") 
                        : (item.type === "lost" ? "✓ Mark as Recovered" : "✓ Mark as Claimed")
                      }
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {item.type === "lost" 
                        ? "Mark this item as recovered (you found your item)" 
                        : "Mark this item as claimed (you gave it to the owner)"
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.contactName && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Posted By</p>
                      <p className="font-medium text-foreground">{item.contactName}</p>
                    </div>
                  </div>
                )}
                {item.contactEmail && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${item.contactEmail}`} className="font-medium text-primary hover:underline">{item.contactEmail}</a>
                    </div>
                  </div>
                )}
                {item.contactPhone && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <a href={`tel:${item.contactPhone}`} className="font-medium text-primary hover:underline">{item.contactPhone}</a>
                    </div>
                  </div>
                )}
                {item.contactEmail && (
                  <div className="pt-4 space-y-2">
                    <a href={`mailto:${item.contactEmail}`} className="block">
                      <Button className="w-full"><Mail className="h-4 w-4 mr-2" />Send Email</Button>
                    </a>
                    {item.contactPhone && (
                      <a href={`tel:${item.contactPhone}`} className="block">
                        <Button variant="outline" className="w-full bg-transparent"><Phone className="h-4 w-4 mr-2" />Call Now</Button>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Posted on</p>
                <p className="text-foreground">{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
