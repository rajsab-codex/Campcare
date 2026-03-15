import type { Complaint, LostFoundItem, ComplaintStatus, Comment } from "./data"
import { mockComplaints } from "./data"

const COMPLAINTS_STORAGE_KEY = "campcare_complaints"
const LOST_FOUND_STORAGE_KEY = "campcare_lost_found"

export function getStoredComplaints(): Complaint[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(COMPLAINTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading complaints from storage:", error)
    return []
  }
}

export function saveComplaint(complaint: Complaint): void {
  if (typeof window === "undefined") return
  try {
    const stored = getStoredComplaints()
    const updated = [...stored, complaint]
    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Error saving complaint to storage:", error)
  }
}

export function getStoredLostFoundItems(): LostFoundItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(LOST_FOUND_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading lost & found items from storage:", error)
    return []
  }
}

export function saveLostFoundItem(item: LostFoundItem): void {
  if (typeof window === "undefined") return
  try {
    const stored = getStoredLostFoundItems()
    const updated = [...stored, item]
    localStorage.setItem(LOST_FOUND_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Error saving lost & found item to storage:", error)
  }
}

export function updateLostFoundItemStatus(itemId: string, status: "found" | "resolved", userId: string, userRole: "student" | "faculty" | "superadmin"): boolean {
  if (typeof window === "undefined") return false
  try {
    const items = getStoredLostFoundItems()
    const index = items.findIndex((i) => i.id === itemId)
    if (index === -1) return false

    const item = items[index]
    // Only allow the original uploader to mark as found/resolved
    if (item.createdBy !== userId) {
      return false
    }

    item.status = status
    items[index] = item

    localStorage.setItem(LOST_FOUND_STORAGE_KEY, JSON.stringify(items))
    return true
  } catch (error) {
    console.error("Error updating lost & found item status:", error)
    return false
  }
}

export function updateComplaintStatus(complaintId: string, newStatus: ComplaintStatus, userId: string, userRole: "student" | "faculty" | "superadmin"): boolean {
  if (typeof window === "undefined") return false
  try {
    const complaints = getStoredComplaints()
    const index = complaints.findIndex((c) => c.id === complaintId)
    if (index === -1) return false

    const complaint = complaints[index]
    
    // Permissions are handled in the component, but we can add a layer here if needed
    
    complaint.status = newStatus
    complaints[index] = complaint

    localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(complaints))
    return true
  } catch (error) {
    console.error("Error updating complaint status:", error)
    return false
  }
}
