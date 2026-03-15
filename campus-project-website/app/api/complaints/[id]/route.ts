import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Complaint from "@/lib/complaint-model"
import { auth } from "@/lib/auth"
import { getUserRole } from "@/lib/getUserRole"

// Helper function to find complaint by ID (supports both MongoDB ObjectId and custom string IDs)
async function findComplaintById(id: string) {
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id)
  
  if (isValidObjectId) {
    return await Complaint.findById(id)
  } else {
    // Handle custom string IDs
    return await Complaint.findOne({ customId: id })
  }
}

// GET function with params as Promise (Next.js 15+)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const complaint = await findComplaintById(id)
    
    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(complaint)
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return NextResponse.json(
      { error: "Failed to fetch complaint" },
      { status: 500 }
    )
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    // Use role from session (set from JWT token via auth.ts type augmentation)
    const currentUserRole = getUserRole(session.user.id, (session.user as any).role || "student")


    // Handle comment addition
    if (body.action === "addComment") {
      const complaint = await findComplaintById(id)
      if (!complaint) {
        return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
      }
      
      const newComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: body.content,
        authorName: session.user.name,
        authorRole: currentUserRole,
        createdBy: session.user.id,
        createdAt: new Date(),
      }
      
      complaint.comments.push(newComment)
      await complaint.save()
      
      return NextResponse.json(complaint, { status: 201 })
    }
    
    // Handle comment deletion
    if (body.action === "deleteComment") {
      const complaint = await findComplaintById(id)
      if (!complaint) {
        return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
      }
      
      const commentIndex = complaint.comments.findIndex(
        (c: any) => c.id === body.commentId
      )
      
      if (commentIndex === -1) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 })
      }
      
      const comment = complaint.comments[commentIndex]
      // Check if user can delete (author or superadmin)
      if (comment.createdBy !== session.user.id && session.user.id !== "2305029") {
        return NextResponse.json(
          { error: "You are not authorized to delete this comment" },
          { status: 403 }
        )
      }
      
      complaint.comments.splice(commentIndex, 1)
      await complaint.save()
      
      return NextResponse.json(complaint)
    }
    
    // Handle status update
    if (body.status) {
      // SECURITY: Only faculty and superadmin (id 2305029) can update status
      const isFaculty = currentUserRole === "faculty"
      const isSuperadmin = session.user.id === "2305029"
      
      if (!isFaculty && !isSuperadmin) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }

      const complaint = await findComplaintById(id)
      
      if (!complaint) {
        return NextResponse.json({ error: "Complaint not found" }, { status: 404 })
      }
      
      complaint.status = body.status
      await complaint.save()
      
      return NextResponse.json(complaint)
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 })

  } catch (error) {
    console.error("Error updating complaint:", error)
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 })
  }
}
