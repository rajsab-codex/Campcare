"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { emergencyContacts, safetyGuidelines } from "@/lib/data"
import {
  ShieldAlert,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Shield,
  BookOpen,
  Users,
  Heart,
  Volume2,
  Share2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { BackButton } from "@/components/back-button"

export default function SOSPage() {
  const [sosTriggered, setSosTriggered] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"idle" | "getting" | "success" | "error">("idle")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [initialLocationStatus, setInitialLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle")
  const [userPhone, setUserPhone] = useState<string>("")

  // Request location access on page load
  useEffect(() => {
    const requestInitialLocation = () => {
      if ("geolocation" in navigator) {
        setInitialLocationStatus("requesting")
        navigator.geolocation.getCurrentPosition(
          () => {
            setInitialLocationStatus("granted")
          },
          () => {
            setInitialLocationStatus("denied")
          }
        )
      } else {
        setInitialLocationStatus("denied")
      }
    }
    requestInitialLocation()
  }, [])

  const handleSOSClick = () => {
    setShowConfirmDialog(true)
  }

  const triggerSOS = async () => {
    setShowConfirmDialog(false)
    setSosTriggered(true)
    setLocationStatus("getting")

    // Get location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          setLocation({
            lat,
            lng,
          })
          
          // Send SOS alert to backend
          try {
            // Try to get user from auth context
            let userId = "anonymous"
            try {
              const stored = sessionStorage.getItem("campcare_user")
              if (stored) {
                const user = JSON.parse(stored)
                userId = user.studentId || user.facultyId || "anonymous"
              }
            } catch {
              // If we can't get user, use anonymous
            }
            
            const response = await fetch("/api/sos", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                userId,
              }),
            })
            
            const result = await response.json()
            
            if (result.success) {
              console.log("SOS alert sent successfully:", result.data)
            } else {
              console.error("Failed to send SOS alert:", result.error)
            }
          } catch (error) {
            console.error("Error sending SOS alert:", error)
          }
          
          setLocationStatus("success")
          
          // Send WhatsApp message with live location
          sendWhatsAppMessage(lat, lng)
        },
        () => {
          setLocationStatus("error")
          // Still try to send WhatsApp message even without location
          sendWhatsAppMessage(null, null)
        },
      )
    } else {
      setLocationStatus("error")
      // Still try to send WhatsApp message even without location
      sendWhatsAppMessage(null, null)
    }
  }

  const sendWhatsAppMessage = (lat: number | null, lng: number | null) => {
    // Use emergency contacts from data - filter for numbers with +91 format for WhatsApp
    const whatsappContacts = emergencyContacts
      .filter(contact => contact.phone.includes("+91"))
      .map(contact => contact.phone.replace(/\s/g, ""))
    
    // If no WhatsApp contacts, use default
    const contacts = whatsappContacts.length > 0 ? whatsappContacts : ["919876511111"] // Campus Medical Center as default
    
    const message = lat && lng 
      ? `🚨 EMERGENCY SOS ALERT! \n\nI need help! My current location:\nhttps://maps.google.com/?q=${lat},${lng}\n\nCoordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      : `🚨 EMERGENCY SOS ALERT! \n\nI need help! Please contact me immediately.`
    
    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(message)
    
    // Open WhatsApp with pre-filled message for first emergency contact
    const whatsappUrl = `https://wa.me/${contacts[0]}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const sendWhatsAppToContact = (phone: string) => {
    const message = `🚨 EMERGENCY NEED YOUR HELP!\n\nPlease respond immediately.`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phone.replace(/\+/g, "").replace(/\s/g, "")}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const handleShareLocation = async () => {
    if ("geolocation" in navigator) {
      setLocationStatus("getting")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })
          setLocationStatus("success")
          // Open WhatsApp share
          sendWhatsAppMessage(lat, lng)
        },
        () => {
          setLocationStatus("error")
          // Still try to send message without location
          sendWhatsAppMessage(null, null)
        }
      )
    } else {
      setLocationStatus("error")
      sendWhatsAppMessage(null, null)
    }
  }

  const resetSOS = () => {
    setSosTriggered(false)
    setLocationStatus("idle")
    setLocation(null)
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Women Safety SOS" description="Emergency assistance and safety resources" />

      <div className="p-6 space-y-8">
        <BackButton />

        {/* SOS Button Section */}
        <Card className="bg-card border-sos/30">
          <CardContent className="p-8">
            <div className="text-center max-w-xl mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sos/10 mx-auto mb-4">
                <ShieldAlert className="h-8 w-8 text-sos" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Emergency SOS</h2>
              <p className="text-muted-foreground mb-8">
                Press the SOS button in case of emergency. This will alert campus security and share your location.
              </p>

              {!sosTriggered ? (
                <button
                  onClick={handleSOSClick}
                  className="relative group w-48 h-48 mx-auto block"
                  aria-label="Trigger SOS"
                >
                  <div className="absolute inset-0 rounded-full bg-sos/20 animate-ping" />
                  <div className="absolute inset-4 rounded-full bg-sos/30 animate-pulse" />
                  <div className="relative w-full h-full rounded-full bg-sos hover:bg-sos/90 transition-colors flex items-center justify-center shadow-lg shadow-sos/30">
                    <div className="text-center">
                      <AlertTriangle className="h-16 w-16 text-sos-foreground mx-auto mb-2" />
                      <span className="text-2xl font-bold text-sos-foreground">SOS</span>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="bg-sos/10 border border-sos/30 rounded-xl p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-sos animate-pulse" />
                    <span className="text-lg font-semibold text-sos">SOS Activated</span>
                  </div>

                  <div className="space-y-3 text-sm text-left mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                      <span className="text-foreground">Alert sent to campus security</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      {locationStatus === "getting" ? (
                        <>
                          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-foreground">Getting your location...</span>
                        </>
                      ) : locationStatus === "success" ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-success shrink-0" />
                          <div>
                            <span className="text-foreground">Location shared</span>
                            {location && (
                              <p className="text-xs text-muted-foreground">
                                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                          <span className="text-foreground">Location unavailable - please share manually</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                      <Volume2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-foreground">Sound alert activated</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a href="tel:100" className="flex-1">
                      <Button className="w-full bg-sos hover:bg-sos/90 text-sos-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Security
                      </Button>
                    </a>
                    <Button variant="outline" onClick={resetSOS} className="bg-transparent">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a href="tel:100">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Call Security</p>
                  <p className="text-sm text-muted-foreground">24/7 Helpline: 100</p>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="tel:181">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sos/10 shrink-0">
                  <Heart className="h-6 w-6 text-sos" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Women Helpline</p>
                  <p className="text-sm text-muted-foreground">National: 181</p>
                </div>
              </CardContent>
            </Card>
          </a>

          <a href="tel:112">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 shrink-0">
                  <Shield className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Police Emergency</p>
                  <p className="text-sm text-muted-foreground">Emergency: 112</p>
                </div>
              </CardContent>
            </Card>
          </a>

          <Card 
            className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer" 
            onClick={handleShareLocation}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 shrink-0">
                <Share2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Share Location</p>
                <p className="text-sm text-muted-foreground">Send via WhatsApp</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts & Guidelines */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Emergency Contacts */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>Important numbers to keep handy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      <span className="text-xs font-medium">Call</span>
                    </a>
                    {contact.phone.includes("+91") && (
                      <button
                        onClick={() => sendWhatsAppToContact(contact.phone)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-success/10 text-success hover:bg-success hover:text-success-foreground transition-colors"
                      >
                        <Share2 className="h-3 w-3" />
                        <span className="text-xs font-medium">WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Safety Guidelines */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Safety Guidelines
              </CardTitle>
              <CardDescription>Tips to stay safe on campus</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {safetyGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{guideline}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Safe Zones on Campus</h3>
                <p className="text-sm text-muted-foreground">
                  Security booths are located at: Main Gate, Library Entrance, Hostel Gate, Sports Complex, and Academic
                  Block. These are staffed 24/7 and equipped with emergency response systems.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sos">
              <AlertTriangle className="h-5 w-5" />
              Confirm SOS Alert
            </DialogTitle>
            <DialogDescription>
              This will immediately alert campus security and share your location. Use only in genuine emergencies.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">What happens when you trigger SOS:</p>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Campus security is immediately notified</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Your location is shared with responders</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Emergency contacts are alerted</span>
              </li>
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={triggerSOS} className="bg-sos hover:bg-sos/90 text-sos-foreground">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Confirm SOS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
