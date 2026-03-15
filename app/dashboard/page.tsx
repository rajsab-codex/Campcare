'use client'

import { useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileWarning, Search, ShieldAlert, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { mockComplaints, mockLostFoundItems } from "@/lib/data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const pendingComplaints = mockComplaints.filter((c) => c.status === "pending").length
  const activeItems = mockLostFoundItems.filter((i) => i.status === "active").length

  useEffect(() => {
    if (user?.role === "superadmin" && !sessionStorage.getItem("adminWelcomeShown")) {
      toast({
        title: "Welcome Master 👑",
        description: "Full system control granted.",
      })
      sessionStorage.setItem("adminWelcomeShown", "true")
    }
  }, [user])

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Dashboard" description="Welcome to CampCare - Your Campus Management Hub" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Complaints"
            value={mockComplaints.length}
            description="All time submissions"
            icon={FileWarning}
            trend={{ value: 12, isPositive: false }}
          />
          <StatCard title="Pending Resolution" value={pendingComplaints} description="Awaiting action" icon={Clock} />
          <StatCard
            title="Lost & Found Items"
            value={activeItems}
            description="Active listings"
            icon={Search}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="SOS System"
            value="Active"
            description="24/7 Emergency Support"
            icon={ShieldAlert}
            className="border-primary/50"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/complaints/new" className="block">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <FileWarning className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">File a Complaint</h3>
                <p className="text-sm text-muted-foreground">
                  Report issues related to campus infrastructure, academics, or services
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/lost-found/new" className="block">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Lost & Found</h3>
                <p className="text-sm text-muted-foreground">
                  Report lost items or help reunite found items with their owners
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/sos" className="block">
            <Card className="bg-card border-sos/50 hover:border-sos transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sos/10 mb-4">
                  <ShieldAlert className="h-7 w-7 text-sos" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Women Safety SOS</h3>
                <p className="text-sm text-muted-foreground">
                  Emergency assistance and safety resources for women on campus
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Complaints */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Complaints</CardTitle>
              <Link href="/dashboard/complaints">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockComplaints.slice(0, 3).map((complaint) => (
                <div key={complaint.id} className="flex items-start gap-4 rounded-lg bg-secondary/50 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{complaint.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{complaint.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          complaint.status === "resolved"
                            ? "default"
                            : complaint.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          complaint.status === "resolved"
                            ? "bg-success text-success-foreground"
                            : complaint.status === "in-progress"
                              ? "bg-warning text-warning-foreground"
                              : ""
                        }
                      >
                        {complaint.status === "resolved" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {complaint.status === "in-progress" && <Clock className="mr-1 h-3 w-3" />}
                        {complaint.status === "pending" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {complaint.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{complaint.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Lost & Found */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Lost & Found</CardTitle>
              <Link href="/dashboard/lost-found">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockLostFoundItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-start gap-4 rounded-lg bg-secondary/50 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={item.type === "lost" ? "destructive" : "default"}
                        className={item.type === "found" ? "bg-success text-success-foreground" : ""}
                      >
                        {item.type}
                      </Badge>
                      <p className="font-medium text-foreground truncate">{item.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      📍 {item.location} • {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
