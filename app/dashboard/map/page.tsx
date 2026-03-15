"use client"

import { useEffect, useRef, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Navigation } from "lucide-react"

const campusLocations = [
  { id: 1, name: "MES College Zuarinagar", description: "Main campus location - Verna, Goa", position: [15.2993, 74.1240] as [number, number], type: "entry" },
]

const typeColors: Record<string, string> = {
  entry: "#22c55e", facility: "#3b82f6", hostel: "#a855f7", security: "#ef4444", sports: "#f97316",
}

interface SearchResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const initializedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null)
  const [showResults, setShowResults] = useState(false)
  const destinationMarkerRef = useRef<any>(null)

  // Default to MES College Zuarinagar, Verna, Goa
  const defaultLocation = { lat: 15.2993, lng: 74.1240 }

  useEffect(() => {
    if (initializedRef.current) return
    
    const initMap = async () => {
      if (!mapRef.current) return
      
      if ((mapRef.current as any)._leaflet_id != null) {
        return
      }
      
      const L = (window as any).L
      if (!L) {
        setError("Leaflet not loaded")
        return
      }
      
      try {
        initializedRef.current = true
        
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })
        
        const mapInstance = L.map(mapRef.current).setView([defaultLocation.lat, defaultLocation.lng], 16)
        mapInstanceRef.current = mapInstance
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(mapInstance)
        
        campusLocations.forEach((loc) => {
          const marker = L.marker(loc.position).addTo(mapInstance)
          marker.bindPopup(`
            <div style="min-width: 150px; font-family: sans-serif;">
              <strong>${loc.name}</strong>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${loc.description}</p>
              <span style="font-size: 10px; padding: 2px 6px; background: ${typeColors[loc.type]}20; color: ${typeColors[loc.type]}; border-radius: 8px;">${loc.type.toUpperCase()}</span>
            </div>
          `)
        })
      } catch (err) {
        console.error("Map error:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize map")
      }
    }
    
    const loadLeaflet = async () => {
      if (!document.getElementById("leaflet-map-page-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-map-page-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }
      
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script")
          s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          s.onload = () => resolve()
          document.head.appendChild(s)
        })
      }
      
      setTimeout(initMap, 100)
    }
    
    loadLeaflet()
  }, [])

  // Search for locations using Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(searchQuery.trim())}`
      )
      if (res.ok) {
        const data = await res.json()
        setSearchResults(data)
        setShowResults(true)
      }
    } catch (err) {
      console.error("Search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectDestination = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    setDestination({ lat, lng, name: result.display_name.split(",")[0] })
    setSearchQuery(result.display_name.split(",")[0])
    setShowResults(false)
    setSearchResults([])

    // Center map on destination
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 17)
      
      // Add or update destination marker
      const L = (window as any).L
      
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([lat, lng])
      } else {
        // Create custom destination marker
        const destinationIcon = L.divIcon({
          className: 'destination-marker',
          html: '<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
        
        destinationMarkerRef.current = L.marker([lat, lng], { icon: destinationIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<strong>Destination</strong><br/>${result.display_name.split(",")[0]}`)
          .openPopup()
      }
    }
  }

  const clearDestination = () => {
    setDestination(null)
    setSearchQuery("")
    if (destinationMarkerRef.current && mapInstanceRef.current) {
      destinationMarkerRef.current.remove()
      destinationMarkerRef.current = null
      mapInstanceRef.current.setView([defaultLocation.lat, defaultLocation.lng], 16)
    }
  }

  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader title="Campus Safety Map" description="Interactive map of safe locations on campus" />
      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    className="pl-9"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSearching ? "..." : "Search"}
                </button>
                {destination && (
                  <button
                    onClick={clearDestination}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSelectDestination(result)}
                      className="w-full px-4 py-3 text-left hover:bg-secondary border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-sm">{result.display_name.split(",")[0]}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.display_name.split(",").slice(1, 4).join(",")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Destination Info */}
            {destination && (
              <div className="mt-3 p-3 bg-primary/10 rounded-md flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <strong>Destination:</strong> {destination.name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            {error ? (
              <div className="h-[500px] flex items-center justify-center bg-muted">
                <p className="text-destructive">Error: {error}</p>
              </div>
            ) : (
              <div ref={mapRef} className="h-[500px] w-full" />
            )}
          </CardContent>
        </Card>

        {/* Safe Spots Legend */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Safe Spots</CardTitle>
            <CardDescription>Campus safety locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(typeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-sm capitalize">{type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campusLocations.map((location) => (
            <Card key={location.id} className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{location.name}</CardTitle>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors[location.type] }} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{location.description}</p>
                <Badge variant="outline" className="mt-2 capitalize" style={{ borderColor: typeColors[location.type], color: typeColors[location.type] }}>
                  {location.type}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

