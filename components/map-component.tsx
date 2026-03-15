"use client"

import { useEffect, useRef, useState } from "react"

const campusLocations = [
  { id: 1, name: "MES College Zuarinagar", description: "Main campus location - Verna, Goa", position: [15.2993, 74.1240] as [number, number], type: "entry" },
]

const typeColors: Record<string, string> = {
  entry: "#22c55e", facility: "#3b82f6", hostel: "#a855f7", security: "#ef4444", sports: "#f97316",
}

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mapRef.current) return
    
    let mapInstance: any = null

    const initMap = () => {
      const L = (window as any).L
      if (!L) {
        setError("Map library not loaded")
        setLoading(false)
        return
      }

      try {
        // Fix marker icons
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        // Create map
        mapInstance = L.map(mapRef.current!).setView([15.2993, 74.1240], 17)

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(mapInstance)

        // Add markers
        campusLocations.forEach((location) => {
          const marker = L.marker(location.position).addTo(mapInstance)
          marker.bindPopup(`
            <div style="min-width: 180px; font-family: sans-serif; padding: 4px;">
              <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600;">${location.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">${location.description}</p>
              <span style="display: inline-block; padding: 2px 10px; font-size: 11px; border-radius: 12px; background-color: ${typeColors[location.type]}20; color: ${typeColors[location.type]}; font-weight: 500;">${location.type.toUpperCase()}</span>
            </div>
          `)
        })

        setLoading(false)
      } catch (err) {
        console.error("Error loading map:", err)
        setError(err instanceof Error ? err.message : "Failed to load map")
        setLoading(false)
      }
    }

    const loadLeaflet = async () => {
      // Load CSS
      if (!document.getElementById("leaflet-map-css")) {
        const link = document.createElement("link")
        link.id = "leaflet-map-css"
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load JS
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script")
          s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          s.onload = () => resolve()
          document.head.appendChild(s)
        })
      }

      setTimeout(initMap, 50)
    }

    loadLeaflet()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
        <p className="text-destructive">Error: {error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height: "500px", width: "100%", borderRadius: "0.5rem" }}
    />
  )
}

