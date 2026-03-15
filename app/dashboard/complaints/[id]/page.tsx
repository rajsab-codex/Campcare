"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/back-button"
import { addNotification } from "@/lib/notifications"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Calendar, User, Tag, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ComplaintStatus, IComment } from "@/lib/data"

interface PageProps {
  params: Promise<{ id: string }>
}

interface MongoComplaint {
  _id: string
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: ComplaintStatus
  createdBy: string
  studentName: string
  createdAt: string
  updatedAt: string
  comments?: IComment[]
}

export default function ComplaintDetailPage({ params }: PageProps) {
  const { user } = useAuth()
  const [id, setId] = useState<string>("")
  const [complaint, setComplaint] = useState<MongoComplaint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [canEdit, setCanEdit] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>("pending")
  const [isSaving, setIsSaving] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  useEffect(() => {
    const loadComplaint = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)

      try {
        const response = await fetch(`/api/complaints/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          // Fetch comments from the new standalone API
          let comments: IComment[] = []
          try {
            const commentsResponse = await fetch(`/api/comments?complaintId=${data._id}`)
            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json()
              comments = commentsData.map((c: any) => ({
                id: c.id,
                message: c.message,
                userName: c.userName,
                role: c.role || "student",
                createdAt: c.createdAt,
                createdBy: c.createdBy,
              }))
            }
          } catch (err) {
            console.error("Error fetching comments:", err)
            comments = data.comments || []
          }
          
          const mongoComplaint: MongoComplaint = {
            _id: data._id,
            id: data._id,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            status: data.status === "resolved" ? "resolved" : data.status === "pending" ? "pending" : "in-progress",
            createdBy: data.createdBy,
            studentName: data.studentName,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            comments: comments,
          }
          
          setComplaint(mongoComplaint)
          setSelectedStatus(mongoComplaint.status)
          
          if (user) {
            const canEditComplaint = user.role === "superadmin" || user.role === "faculty"
            setCanEdit(canEditComplaint)
          }
        }
      } catch (error) {
        console.error("Error fetching complaint:", error)
      }
      setIsLoading(false)
    }

    loadComplaint()
  }, [params, user])

  const handleStatusUpdate = async () => {
    if (!complaint || !user) return

    setIsSaving(true)
    try {
      // Try MongoDB API first
      const response = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (response.ok) {
        const updatedComplaint = await response.json()
        
        addNotification({
          type: "complaint-update",
          title: "Complaint Status Updated",
          message: `Your complaint "${complaint.title}" status changed to ${selectedStatus}`,
          complaintId: complaint.id,
          read: false,
        })

        setComplaint({
          ...complaint,
          status: selectedStatus,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddComment = async () => {
    if (!complaint || !user || !newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      // Use new standalone comment API with userId, userName and userType
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintId: complaint.id,
          message: newComment.trim(),
        }),
      })

      if (response.ok) {
        // Fetch updated comments from the new API
        const commentsResponse = await fetch(`/api/comments?complaintId=${complaint.id}`)
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          // Transform comments to match frontend format
          const transformedComments = commentsData.map((c: any) => ({
            id: c.id,
            message: c.message,
            userName: c.userName,
            role: c.role || "student",
            createdAt: c.createdAt,
            createdBy: c.createdBy,
          }))
          setComplaint({
            ...complaint,
            comments: transformedComments,
            updatedAt: new Date().toISOString(),
          })
        }
        setNewComment("")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!complaint || !user) return

    const confirmed = window.confirm("Are you sure you want to delete this comment?")
    if (!confirmed) return

    setDeletingCommentId(commentId)
    try {
      // Use new standalone comment API
      const response = await fetch(
        `/api/comments/${commentId}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        // Fetch updated comments from the new API
        const commentsResponse = await fetch(`/api/comments?complaintId=${complaint.id}`)
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          // Transform comments to match frontend format
          const transformedComments = commentsData.map((c: any) => ({
            id: c.id,
            message: c.message,
            userName: c.userName,
            role: c.role || "student",
            createdAt: c.createdAt,
            createdBy: c.createdBy,
          }))
          setComplaint({
            ...complaint,
            comments: transformedComments,
            updatedAt: new Date().toISOString(),
          })
        }
      } else if (response.status === 403) {
        alert("Failed to delete comment. You can only delete your own comments or you need superadmin privileges.")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    } finally {
      setDeletingCommentId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Complaint Details" />
        <div className="p-6 text-center">Loading...</div>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Complaint Details" />
        <div className="p-6">
          <Link
            href="/dashboard/complaints"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Complaints
          </Link>
          <Card className="mt-6 bg-card border-border">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Complaint not found</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusConfig = {
    pending: { color: "bg-muted text-muted-foreground", icon: AlertCircle, label: "Pending Review" },
    "in-progress": { color: "bg-warning/20 text-warning", icon: Clock, label: "In Progress" },
    resolved: { color: "bg-success/20 text-success", icon: CheckCircle, label: "Resolved" },
  }

  const status = statusConfig[complaint.status]
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Complaint Details" />

      <div className="p-6">
        <BackButton />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <Badge className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className="bg-transparent capitalize">
                    {complaint.category}
                  </Badge>
                  
                </div>
                <CardTitle className="text-2xl">{complaint.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{complaint.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <CheckCircle className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-foreground">Complaint Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(complaint.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {complaint.status !== "pending" && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning">
                          <Clock className="h-4 w-4 text-warning-foreground" />
                        </div>
                        {complaint.status === "resolved" && <div className="w-0.5 flex-1 bg-border mt-2" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-foreground">Under Review</p>
                        <p className="text-sm text-muted-foreground">Assigned to maintenance team</p>
                      </div>
                    </div>
                  )}

                  {complaint.status === "resolved" && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
                          <CheckCircle className="h-4 w-4 text-success-foreground" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Resolved</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(complaint.updatedAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Comments ({complaint.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Comments */}
                {complaint.comments && complaint.comments.length > 0 ? (
                  <div className="space-y-4">
                    {complaint.comments.map((comment) => (
                      <div key={comment.id} className="relative flex gap-3 p-3 rounded-lg bg-secondary/50">
                        {user && (comment.createdBy === user.id || user.id === "2305029") && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="absolute top-2 right-2 text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            title="Delete comment"
                          >
                            🗑️
                          </button>
                        )}
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {(comment.userName || "User").charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{comment.userName}</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {comment.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{comment.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                  </div>
                )}

                {/* Add Comment Form */}
                {user ? (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full min-h-[80px] p-3 text-sm border border-border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isSubmittingComment}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                        size="sm"
                      >
                        {isSubmittingComment ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Please log in to add comments.</p>
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Log In
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Complaint ID</p>
                    <p className="font-mono text-sm text-foreground">{complaint.id.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted By</p>
                    <p className="text-sm text-foreground">{complaint.studentName}</p>
                    
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted On</p>
                    <p className="text-sm text-foreground">
                      {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm text-foreground">
                      {new Date(complaint.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user && user.role !== "student" && (
            <Card className="bg-card border-primary/30">

                            <CardHeader>

                              <CardTitle className="text-lg">Update Status</CardTitle>

                            </CardHeader>

                            <CardContent className="space-y-4">

                              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ComplaintStatus)}>

                                <SelectTrigger className="bg-secondary border-border">

                                  <SelectValue />

                                </SelectTrigger>

                                <SelectContent>

                                  <SelectItem value="pending">Pending</SelectItem>

                                  <SelectItem value="in-progress">In Progress</SelectItem>

                                  <SelectItem value="resolved">Resolved</SelectItem>

                                </SelectContent>

                              </Select>

                              <Button

                                onClick={handleStatusUpdate}

                                disabled={isSaving || selectedStatus === complaint.status}

                                className="w-full"

                              >

                                {isSaving ? "Saving..." : "Update Status"}

                              </Button>

                            </CardContent>

                          </Card>
            )}

            
          </div>
        </div>
      </div>
    </div>
  )
}
