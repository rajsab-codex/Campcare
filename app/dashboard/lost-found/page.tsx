"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockLostFoundItems, type LostFoundItem } from "@/lib/data"
import { getStoredLostFoundItems } from "@/lib/storage"
import { useAuth } from "@/components/auth-provider"
import { canAddLostFound } from "@/lib/permissions"
import { Plus, Search, MapPin, Calendar, Package, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { BackButton } from "@/components/back-button"

const categories = ["All", "Electronics", "Bags", "Documents", "Accessories", "Books", "Others"]

export default function LostFoundPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [activeTab, setActiveTab] = useState("all")

  // Check if user can add items
  const canPost = user ? canAddLostFound(user) : false

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/lost-found")
        if (response.ok) {
          const data = await response.json()
          // Transform MongoDB data to match frontend interface
          const mongoItems = data.map((item: any) => ({
            id: item._id,
            type: item.type,
            title: item.itemName,
            description: item.description,
            category: item.category || "Others",
            location: item.location,
            date: item.date || item.createdAt,
            contactName: item.contactName || item.createdBy,
            contactEmail: item.contactEmail || "",
            contactPhone: item.contactPhone || "",
            createdAt: item.createdAt,
            createdBy: item.createdBy,
            status: item.status === "open" ? "active" : "resolved",
          }))
          const allItems = [...mockLostFoundItems, ...mongoItems]
          setItems(allItems)
        } else {
          // Fallback to localStorage if API fails
          const storedItems = getStoredLostFoundItems()
          const allItems = [...mockLostFoundItems, ...storedItems]
          setItems(allItems)
        }
      } catch (error) {
        console.error("Error fetching lost & found items:", error)
        // Fallback to localStorage
        const storedItems = getStoredLostFoundItems()
        const allItems = [...mockLostFoundItems, ...storedItems]
        setItems(allItems)
      }
    }
    fetchItems()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
    const matchesTab = activeTab === "all" || item.type === activeTab
    return matchesSearch && matchesCategory && matchesTab && item.status === "active"
  })

  const stats = {
    total: items.filter((i) => i.status === "active").length,
    lost: items.filter((i) => i.type === "lost" && i.status === "active").length,
    found: items.filter((i) => i.type === "found" && i.status === "active").length,
    resolved: items.filter((i) => i.status === "found" || i.status === "resolved").length,
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Lost & Found" description="Report lost items or help reunite found items with owners" />

      <div className="p-6 space-y-6">
        <BackButton />

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-destructive/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Lost Items</p>
              <p className="text-2xl font-bold text-destructive">{stats.lost}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-success/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Found Items</p>
              <p className="text-2xl font-bold text-success">{stats.found}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-primary/30">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Reunited</p>
              <p className="text-2xl font-bold text-primary">{stats.resolved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Filters */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TabsList className="bg-secondary">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="lost">Lost</TabsTrigger>
                <TabsTrigger value="found">Found</TabsTrigger>
              </TabsList>
              {canPost && (
                <Link href="/dashboard/lost-found/new">
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Item
                  </Button>
                </Link>
              )}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary border-border"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-44 bg-secondary border-border">
                  <SelectValue placeholder="Category" />
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

            <TabsContent value="all" className="mt-0">
              <ItemGrid items={filteredItems} />
            </TabsContent>
            <TabsContent value="lost" className="mt-0">
              <ItemGrid items={filteredItems} />
            </TabsContent>
            <TabsContent value="found" className="mt-0">
              <ItemGrid items={filteredItems} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ItemGrid({ items }: { items: LostFoundItem[] }) {
  if (items.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Link href="/dashboard/lost-found/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post an Item
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.id}
          className="bg-card border-border hover:border-primary/30 transition-colors overflow-hidden group"
        >
          <div className="aspect-video bg-secondary relative">
            {item.imageUrl ? (
              <img src={item.imageUrl || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
            <Badge
              className={`absolute top-3 left-3 ${
                item.type === "lost"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-success text-success-foreground"
              }`}
            >
              {item.type === "lost" ? (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" /> Lost
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Found
                </>
              )}
            </Badge>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground line-clamp-1">{item.title}</h3>
              <Badge variant="outline" className="shrink-0 bg-transparent text-xs">
                {item.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
            <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>{item.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
            <Link href={`/dashboard/lost-found/${item.id}`}>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View Details & Contact
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
