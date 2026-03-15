"use client"

import { useState, useEffect } from "react"
import { Bell, Clock, CheckCircle, AlertCircle, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getNotifications, markNotificationAsRead, removeNotification, clearAllNotifications, getUnreadCount } from "@/lib/notifications"
import type { Notification } from "@/lib/notifications"
import Link from "next/link"

export function NotificationsPopup() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const loadNotifications = () => {
    const notifs = getNotifications()
    setNotifications(notifs)
    setUnreadCount(getUnreadCount())
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id)
    loadNotifications()
  }

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeNotification(id)
    loadNotifications()
  }

  const handleClearAll = () => {
    clearAllNotifications()
    loadNotifications()
  }

  const getNotificationLink = (notif: Notification): string => {
    if (notif.complaintId) {
      return "/dashboard/complaints/" + notif.complaintId
    }
    if (notif.lostFoundId) {
      return "/dashboard/lost-found/" + notif.lostFoundId
    }
    return "#"
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "complaint-update":
        return <AlertCircle className="h-4 w-4 text-primary" />
      case "lost-found-match":
        return <CheckCircle className="h-4 w-4 text-success" />
      case "system":
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-muted-foreground hover:text-destructive h-7 px-2"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={"border-b border-border hover:bg-secondary/50 transition-colors " + (!notif.read ? "bg-primary/5" : "")}
                >
                  <div className="p-4">
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm text-foreground">{notif.title}</h4>
                          {!notif.read && <Badge className="bg-primary text-[10px] h-5 px-1.5 shrink-0">New</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <Link href={getNotificationLink(notif)} onClick={() => handleMarkRead(notif.id)}>
                            <Button variant="outline" size="sm" className="h-6 text-xs px-2 bg-transparent">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleRemove(notif.id, e)}
                        className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                        title="Remove notification"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

