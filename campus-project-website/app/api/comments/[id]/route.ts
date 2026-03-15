import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Comment from "@/lib/comment-model"
import { auth } from "@/lib/auth"

// DELETE /api/comments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const requestingUserId = session.user.id;

    await connectDB()
    const { id } = await params
    
    // Find the comment
    const comment = await Comment.findById(id)
    
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }
    
    // Check permission: only owner or superadmin (userId === "2305029") can delete
    const isOwner = comment.createdBy === requestingUserId
    const isSuperadmin = requestingUserId === "2305029"
    
    if (!isOwner && !isSuperadmin) {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own comments" },
        { status: 403 }
      )
    }
    
    // Delete the comment
    await Comment.findByIdAndDelete(id)
    
    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    )
  }
}
