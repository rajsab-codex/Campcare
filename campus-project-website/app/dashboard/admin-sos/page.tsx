"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Clock, RefreshCw, MapPin } from "lucide-react"
import { SOSAlert } from "@/lib/sos-types"

export default function AdminSOSPage() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/sos")
      const result = await response.json()
      
      if (result.success) {
        setAlerts(result.data)
      } else {
        setError(result.error || "Failed to fetch alerts")
      }
    } catch (err) {
      setError("Failed to connect to server")
      console.error("Error fetching SOS alerts:", err)
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (id: string) => {
    try {
      const response = await fetch("/api/sos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update the local state to reflect the change
        setAlerts(prev => 
          prev.map(alert => 
            alert.id === id ? { ...alert, status: "resolved" } : alert
          )
        )
      } else {
        console.error("Failed to resolve alert:", result.error)
      }
    } catch (err) {
      console.error("Error resolving alert:", err)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const activeAlerts = alerts.filter(a => a.status === "active")
  const resolvedAlerts = alerts.filter(a => a.status === "resolved")

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="SOS Alerts Management" 
        description="Monitor and manage emergency SOS alerts" 
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Clock className="h-4 w-4 text-sos" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sos">{activeAlerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{resolvedAlerts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>SOS Alerts</CardTitle>
              <CardDescription>All emergency alerts from users</CardDescription>
            </div>
            <Button onClick={fetchAlerts} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-destructive">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            ) : alerts.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                No SOS alerts found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{alert.userId}</TableCell>
                      <TableCell>{formatTimestamp(alert.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant={alert.status === "active" ? "destructive" : "secondary"}>
                          {alert.status === "active" ? "Active" : "Resolved"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {alert.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            className="text-success hover:text-success hover:bg-success/10"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
