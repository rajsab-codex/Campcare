"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Complaint, type ComplaintStatus, type ComplaintCategory, type ComplaintPriority } from "@/lib/data"
import { getStoredComplaints, updateComplaintStatus } from "@/lib/storage"
import { Plus, Search, Clock, CheckCircle, AlertCircle, Filter, Calendar, User } from "lucide-react"
import Link from "next/link"
import { BackButton } from "@/components/back-button"
import { useAuth } from "@/components/auth-provider"
import { canUpdateComplaintStatus } from "@/lib/permissions"
import { getUserId } from "@/lib/auth"

const statusColors: Record<ComplaintStatus, string> = {
  pending: "bg-muted text-muted-foreground border-muted",
  "in-progress": "bg-warning/20 text-warning border-warning/30",
  resolved: "bg-success/20 text-success border-success/30",
}

const priorityColors: Record<ComplaintPriority, string> = {
  low: "bg-green-500/20 text-green-500 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  critical: "bg-red-500/20 text-red-500 border-red-500/30",
}

const statusIcons: Record<ComplaintStatus, typeof Clock> = {
  pending: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle,
}

const categoryLabels: Record<ComplaintCategory, string> = {
  infrastructure: "Infrastructure",
  academic: "Academic",
  hostel: "Hostel",
  canteen: "Canteen",
  transport: "Transport",
  other: "Other",
}

export default function ComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const handleStatusUpdate = (complaintId: string, newStatus: ComplaintStatus) => {
    if (user) {
      updateComplaintStatus(complaintId, newStatus, getUserId(user), user.role)
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    }
  }

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch("/api/complaints")
        if (response.ok) {
          const data = await response.json()
          const mongoComplaints = data.map((c: any) => ({
            id: c._id,
            title: c.title,
            description: c.description,
            category: c.category,
            status: c.status === "resolved" ? "resolved" : c.status === "pending" ? "pending" : "in-progress",
            priority: c.priority,
            studentName: c.createdBy,
            studentId: c.createdBy,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          }))
          setComplaints(mongoComplaints)
        } else {
          setComplaints([])
        }
      } catch (error) {
        console.error("Error fetching complaints:", error)
        setComplaints([])
      }
    }
    fetchComplaints()
  }, [])

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesCategory = categoryFilter === "all" || complaint.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in-progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Campus Complaints" description="View and manage all campus complaints" />
      <div className="p-6 space-y-6">
        <BackButton />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Complaints</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-success">{stats.resolved}</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64 bg-secondary border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-secondary border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="canteen">Canteen</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/dashboard/complaints/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Complaint
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No complaints found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No complaints have been submitted yet"}
                </p>
                <Link href="/dashboard/complaints/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    File a Complaint
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredComplaints.map((complaint) => {
              if (!complaint) return null
              const StatusIcon = statusIcons[complaint.status] || AlertCircle
              return (
                <Card key={complaint.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className={statusColors[complaint.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {complaint.status}
                          </Badge>
                          <Badge className={priorityColors[complaint.priority] || priorityColors.medium}>
                            {complaint.priority ? complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1) : 'Medium'}
                          </Badge>
                          <Badge variant="outline" className="bg-transparent">
                            {categoryLabels[complaint.category]}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{complaint.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{complaint.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.studentName} ({complaint.studentId})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/complaints/${complaint.id}`}>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Details
                          </Button>
                        </Link>
                        {user && user.role !== "student" && (user.role === "faculty" || user.role === "superadmin" || user.id === "2305029") && (
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => handleStatusUpdate(complaint.id, value as ComplaintStatus)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
