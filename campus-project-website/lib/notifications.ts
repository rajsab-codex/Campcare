// Notifications system for complaint updates

export interface Notification {
  id: string
  type: "complaint-update" | "lost-found-match" | "system"
  title: string
  message: string
  complaintId?: string
  lostFoundId?: string
  read: boolean
  createdAt: string
}

const NOTIFICATIONS_STORAGE_KEY = "campcare_notifications"

export function getNotifications(): Notification[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading notifications:", error)
    return []
  }
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt">): Notification {
  if (typeof window === "undefined") return { ...notification, id: "", createdAt: "" }
  try {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    const notifications = getNotifications()
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([newNotification, ...notifications]))
    return newNotification
  } catch (error) {
    console.error("Error adding notification:", error)
    return { ...notification, id: "", createdAt: "" }
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === "undefined") return
  try {
    const notifications = getNotifications()
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

export function removeNotification(id: string): void {
  if (typeof window === "undefined") return
  try {
    const notifications = getNotifications()
    const updated = notifications.filter((n) => n.id !== id)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Error removing notification:", error)
  }
}

export function clearAllNotifications(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]))
  } catch (error) {
    console.error("Error clearing notifications:", error)
  }
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length
}
