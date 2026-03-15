import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import LostFound from "@/lib/lostfound-model"

export async function GET() {
  try {
    await connectDB()
    const items = await LostFound.find({}).sort({ createdAt: -1 })
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching lost & found items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const item = await LostFound.create({
      type: body.type,
      itemName: body.itemName || body.title,
      description: body.description,
      location: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      date: body.date,
      category: body.category,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      imageUrl: body.imageUrl || "",
      status: "open",
      createdBy: body.createdBy,
    })
    
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error creating lost & found item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
