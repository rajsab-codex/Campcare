import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import LostFound from "@/lib/lostfound-model"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const item = await LostFound.findById(id)
    
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    // Handle comment addition
    if (body.action === "addComment") {
      const item = await LostFound.findById(id)
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      
      const newComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: body.content,
        authorName: body.authorName,
        authorRole: body.authorRole,
        createdBy: body.createdBy,
        createdAt: new Date(),
      }
      
      item.comments.push(newComment)
      await item.save()
      
      return NextResponse.json(item, { status: 201 })
    }
    
    // Handle comment deletion
    if (body.action === "deleteComment") {
      const item = await LostFound.findById(id)
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      
      const commentIndex = item.comments.findIndex(
        (c: any) => c.id === body.commentId
      )
      
      if (commentIndex === -1) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 })
      }
      
      // Check if user can delete (author or superadmin)
      if (body.createdBy !== item.createdBy && body.userRole !== "superadmin") {
        return NextResponse.json(
          { error: "You can only delete your own comments" },
          { status: 403 }
        )
      }
      
      item.comments.splice(commentIndex, 1)
      await item.save()
      
      return NextResponse.json(item)
    }
    
    // Handle status update (only the original creator can mark as found/closed)
    if (body.status) {
      const existingItem = await LostFound.findById(id)
      
      if (!existingItem) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      
      // Only allow the original creator to update status
      if (existingItem.createdBy !== body.userId && body.userId !== "2305029") {
        return NextResponse.json(
          { error: "Only the original poster can mark this item as found" },
          { status: 403 }
        )
      }


      
      const item = await LostFound.findByIdAndUpdate(
        id,
        { status: body.status },
        { new: true }
      )
      
      if (!item) {
        return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json(item)
    }
    
    return NextResponse.json({ error: "No action specified" }, { status: 400 })

  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    )
  }
}
