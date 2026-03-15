import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Complaint from "@/lib/complaint-model"

export async function GET() {
  try {
    await connectDB()
    const complaints = await Complaint.find({}).sort({ createdAt: -1 })
    return NextResponse.json(complaints)
  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const complaint = await Complaint.create({
      title: body.title,
      description: body.description,
      category: body.category || "other",
      priority: body.priority || "medium",
      status: "pending",
      createdBy: body.createdBy,
    })
    
    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error("Error creating complaint:", error)
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 })
  }
}
