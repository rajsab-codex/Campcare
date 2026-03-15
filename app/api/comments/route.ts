import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Comment from "@/lib/comment-model"
import mongoose from "mongoose"
import { getUserRole } from "@/lib/getUserRole"

// GET /api/comments?complaintId=ID
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const complaintId = searchParams.get("complaintId")
    
    if (!complaintId) {
      return NextResponse.json({ error: "complaintId is required" }, { status: 400 })
    }
    
    const comments = await Comment.find({
      complaintId: new mongoose.Types.ObjectId(complaintId)
    }).sort({ createdAt: 1 })

    const transformedComments = (comments || []).map((comment: any) => {
      return {
        id: comment._id,
        message: comment.message,
        role: comment.role,
        userName: comment.userName,
        createdAt: comment.createdAt,
        createdBy: comment.createdBy,
      }
    })
    
    return NextResponse.json(transformedComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/comments
import { auth } from "@/lib/auth"
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    const { complaintId, message } = body
    
    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      )
    }
    
    if (!complaintId) {
      return NextResponse.json(
        { error: "complaintId is required" },
        { status: 400 }
      )
    }
    
    // Determine role using getUserRole helper (role is stored in JWT token)
    const role = getUserRole(session.user.id, (session.user.role as string) || "student")

    
    const newComment = await Comment.create({
      complaintId: new mongoose.Types.ObjectId(complaintId),
      message,
      createdBy: session.user.id,
      userName: session.user.name,
      role: role,
    })
    
    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
