import type { User } from "./auth"

export function canAddLostFound(user: User): boolean {
  return user.role === "student" || user.role === "faculty" || user.role === "superadmin"
}

export function canEditOwnLostFound(user: User, itemUserId?: string): boolean {
  return user.role === "student" && itemUserId === user.id
}

export function canSubmitComplaints(user: User): boolean {
  return user.role === "student"
}

export function canViewComplaints(user: User): boolean {
  return true // Both students and faculty can view complaints
}

export function canUpdateComplaintStatus(user: User): boolean {
  return user.role === "faculty" || user.role === "superadmin"
}

export function canViewAllData(user: User): boolean {
  return user.role === "faculty"
}

export function canEditLostFound(user: User): boolean {
  return false // Only the original poster can edit their own items
}
