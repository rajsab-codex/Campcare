// In-memory SOS store - can be easily replaced with MongoDB later
import { SOSAlert, SOSStatus } from "./sos-types"

// In-memory storage for SOS alerts
// This will be reset when the server restarts
// In production, this should be replaced with a database connection
let sosAlerts: SOSAlert[] = []

/**
 * Generate a unique ID for SOS alerts
 */
function generateId(): string {
  return `sos_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Add a new SOS alert to the store
 */
export function addSOSAlert(
  latitude: number,
  longitude: number,
  userId: string
): SOSAlert {
  const alert: SOSAlert = {
    id: generateId(),
    userId,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    status: "active",
  }
  
  sosAlerts.push(alert)
  return alert
}

/**
 * Get all SOS alerts
 */
export function getSOSAlerts(): SOSAlert[] {
  // Return a copy to avoid mutation
  return [...sosAlerts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

/**
 * Get active SOS alerts only
 */
export function getActiveSOSAlerts(): SOSAlert[] {
  return sosAlerts
    .filter(alert => alert.status === "active")
    .sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
}

/**
 * Resolve an SOS alert by ID
 */
export function resolveSOSAlert(id: string): SOSAlert | null {
  const alertIndex = sosAlerts.findIndex(alert => alert.id === id)
  
  if (alertIndex === -1) {
    return null
  }
  
  sosAlerts[alertIndex] = {
    ...sosAlerts[alertIndex],
    status: "resolved",
  }
  
  return sosAlerts[alertIndex]
}

/**
 * Get a single SOS alert by ID
 */
export function getSOSAlertById(id: string): SOSAlert | null {
  return sosAlerts.find(alert => alert.id === id) || null
}

/**
 * Clear all SOS alerts (for testing purposes)
 */
export function clearSOSAlerts(): void {
  sosAlerts = []
}
