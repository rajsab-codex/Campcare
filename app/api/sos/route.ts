import { NextRequest, NextResponse } from "next/server"
import { addSOSAlert, getSOSAlerts, resolveSOSAlert } from "@/lib/sos-store"
import { CreateSOSAlertRequest, SOSAlert } from "@/lib/sos-types"

/**
 * POST /api/sos
 * Create a new SOS alert
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateSOSAlertRequest = await request.json()
    
    // Validate required fields
    if (typeof body.latitude !== "number" || typeof body.longitude !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates" },
        { status: 400 }
      )
    }
    
    // Validate latitude and longitude ranges
    if (body.latitude < -90 || body.latitude > 90 || body.longitude < -180 || body.longitude > 180) {
      return NextResponse.json(
        { success: false, error: "Coordinates out of range" },
        { status: 400 }
      )
    }
    
    // Get userId from request body or use "anonymous"
    const userId = body.userId || "anonymous"
    
    // Create the SOS alert
    const alert = addSOSAlert(body.latitude, body.longitude, userId)
    
    return NextResponse.json(
      { success: true, data: alert },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating SOS alert:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create SOS alert" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sos
 * Get all SOS alerts
 * 
 * Query params:
 * - status: "active" | "resolved" | "all" (default: "all")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    
    let alerts: SOSAlert[]
    
    if (status === "active") {
      alerts = getSOSAlerts().filter(alert => alert.status === "active")
    } else if (status === "resolved") {
      alerts = getSOSAlerts().filter(alert => alert.status === "resolved")
    } else {
      alerts = getSOSAlerts()
    }
    
    return NextResponse.json(
      { success: true, data: alerts },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching SOS alerts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch SOS alerts" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/sos
 * Resolve an SOS alert
 * 
 * Body params:
 * - id: string (required)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Alert ID is required" },
        { status: 400 }
      )
    }
    
    const alert = resolveSOSAlert(id)
    
    if (!alert) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: true, data: alert },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error resolving SOS alert:", error)
    return NextResponse.json(
      { success: false, error: "Failed to resolve SOS alert" },
      { status: 500 }
    )
  }
}
