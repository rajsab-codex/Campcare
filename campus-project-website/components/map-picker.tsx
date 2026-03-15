"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

// Type declarations for Google Maps and Leaflet
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any
    L: any
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// MapPicker: loads Google Maps JS API if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
// Falls back to Leaflet/OpenStreetMap if API key is missing.
export default function MapPicker({ 
  initialLat = 15.2993, 
  initialLng = 74.1240,
  onClose, 
  onConfirm,
  showModal = true 
}: {
  initialLat?: number
  initialLng?: number
  onClose: () => void
  onConfirm: (lat: number, lng: number, label: string) => void
  showModal?: boolean
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerInstanceRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [markerPos, setMarkerPos] = useState({ lat: initialLat, lng: initialLng })
  const [labelText, setLabelText] = useState("")
  const [editing, setEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const apiKey = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string) || ""

  // Load Google Maps if apiKey present, otherwise set loaded so fallback runs
  useEffect(() => {
    if (!apiKey) {
      setLoaded(true)
      return
    }

    const existing = document.getElementById("google-maps-script")
    if (existing) {
      if (window.google) setLoaded(true)
      else existing.addEventListener("load", () => setLoaded(true))
      return
    }

    const s = document.createElement("script")
    s.id = "google-maps-script"
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    s.async = true
    s.defer = true
    s.onload = () => setLoaded(true)
    document.head.appendChild(s)
  }, [apiKey])

  // Helper: get readable label preferring locality/village names
  const getReadableLabel = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    // Try Google Geocoder first if available
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      try {
        const label = await new Promise<string | null>((resolve) => {
          new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (results: any, status: string) => {
            if (status === "OK" && results && results.length) {
              const comp = results[0].address_components || []
              const prefer = ["locality", "sublocality", "neighborhood", "postal_town", "administrative_area_level_3", "administrative_area_level_2"]
              for (const p of prefer) {
                const found = comp.find((c: any) => c.types && c.types.includes(p))
                if (found) return resolve(found.long_name)
              }
              return resolve(results[0].formatted_address)
            }
            resolve(null)
          })
        })
        if (label) return label
      } catch {
        // fallthrough to Nominatim
      }
    }

    // Fallback: Nominatim reverse geocode and prefer address fields
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      if (!res.ok) return null
      const data = await res.json()
      if (data && data.address) {
        const a = data.address
        const prefer = ["hamlet", "village", "suburb", "neighbourhood", "town", "city_district", "city", "county", "state"]
        for (const key of prefer) {
          if (a[key]) {
            const extra = a.county || a.state || a.country
            return extra ? `${a[key]}, ${extra}` : a[key]
          }
        }
      }
      return data.display_name || null
    } catch {
      return null
    }
  }, [])

  const resolveAndSetLabel = useCallback(async (lat: number, lng: number) => {
    const label = await getReadableLabel(lat, lng)
    if (label) {
      setLabelText(label)
      return label
    }
    setLabelText("Selected location")
    return null
  }, [getReadableLabel])

  // Main initializer: Google Maps OR Leaflet fallback
  useEffect(() => {
    if (!loaded) return

    // GOOGLE MAPS
    if (apiKey && window.google) {
      const center = { lat: markerPos.lat, lng: markerPos.lng }
      const map = new window.google.maps.Map(mapRef.current!, { 
        center, 
        zoom: 14,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false
      })
      const marker = new window.google.maps.Marker({ position: center, map, draggable: true })
      mapInstanceRef.current = map
      markerInstanceRef.current = marker

      map.addListener("click", async (e: any) => {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        marker.setPosition({ lat, lng })
        setMarkerPos({ lat, lng })
        await resolveAndSetLabel(lat, lng)
      })

      marker.addListener("dragend", async () => {
        const pos = marker.getPosition()
        const lat = pos.lat()
        const lng = pos.lng()
        setMarkerPos({ lat, lng })
        await resolveAndSetLabel(lat, lng)
      })

      // initial label
      ;(async () => {
        await resolveAndSetLabel(markerPos.lat, markerPos.lng)
      })()

      return () => {
        // Google Maps cleans up when element removed
      }
    }

    // LEAFLET FALLBACK (no API key)
    ;(async () => {
      // load CSS
      if (!document.getElementById("leaflet-css")) {
        const lcss = document.createElement("link")
        lcss.id = "leaflet-css"
        lcss.rel = "stylesheet"
        lcss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(lcss)
      }
      // load script
      if (!window.L) {
        await new Promise((resolve) => {
          if (document.getElementById("leaflet-script")) {
            document.getElementById("leaflet-script")!.addEventListener("load", resolve)
            return
          }
          const ls = document.createElement("script")
          ls.id = "leaflet-script"
          ls.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          ls.async = true
          ls.onload = resolve
          document.head.appendChild(ls)
        })
      }

      // Fix Leaflet default marker icon
      delete (window.L.Icon.Default.prototype as any)._getIconUrl
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // initialize map
      const map = window.L.map(mapRef.current!).setView([markerPos.lat, markerPos.lng], 14)
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      const marker = window.L.marker([markerPos.lat, markerPos.lng], { draggable: true }).addTo(map)
      mapInstanceRef.current = map
      markerInstanceRef.current = marker

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setMarkerPos({ lat, lng })
        await resolveAndSetLabel(lat, lng)
      })

      marker.on("dragend", async () => {
        const pos = marker.getLatLng()
        setMarkerPos({ lat: pos.lat, lng: pos.lng })
        await resolveAndSetLabel(pos.lat, pos.lng)
      })

      // initial reverse geocode
      ;(async () => {
        await resolveAndSetLabel(markerPos.lat, markerPos.lng)
      })()

      return () => {
        try { map.remove() } catch { /* ignore */ }
      }
    })()

  }, [loaded, apiKey, markerPos.lat, markerPos.lng, resolveAndSetLabel])

  // Ensure we have a readable label when editing is closed
  useEffect(() => {
    if (!editing && !labelText) {
      resolveAndSetLabel(markerPos.lat, markerPos.lng)
    }
  }, [markerPos, editing, labelText, resolveAndSetLabel])

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const t = setTimeout(async () => {
      try {
        setSearching(true)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(
            searchQuery.trim()
          )}`
        )
        if (!res.ok) {
          setSearchResults([])
          return
        }
        const data = await res.json()
        const mapped = (data || []).map((item: any) => {
          const a = item.address || {}
          const primary =
            a.suburb ||
            a.neighbourhood ||
            a.village ||
            a.town ||
            a.city ||
            item.name ||
            (item.display_name ? item.display_name.split(",")[0] : "Location")

          const secondaryParts = [
            a.city || a.town || a.village || a.county || "",
            a.state || "",
            a.country || ""
          ].filter(Boolean)

          return {
            title: primary,
            subtitle: secondaryParts.join(", "),
            address: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon)
          }
        })
        setSearchResults(mapped)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => clearTimeout(t)
  }, [searchQuery])

  const handleSelectSearchResult = (item: any) => {
    const displayLabel = item.subtitle ? `${item.title}, ${item.subtitle}` : item.title
    setMarkerPos({ lat: item.lat, lng: item.lng })
    setLabelText(displayLabel || item.address || "Selected location")
    setSearchQuery("")
    setSearchResults([])

    if (markerInstanceRef.current) {
      if (markerInstanceRef.current.setPosition) {
        markerInstanceRef.current.setPosition({ lat: item.lat, lng: item.lng })
      } else if (markerInstanceRef.current.setLatLng) {
        markerInstanceRef.current.setLatLng([item.lat, item.lng])
      }
    }

    if (mapInstanceRef.current) {
      if (mapInstanceRef.current.setCenter) {
        mapInstanceRef.current.setCenter({ lat: item.lat, lng: item.lng })
      } else if (mapInstanceRef.current.setView) {
        mapInstanceRef.current.setView([item.lat, item.lng], mapInstanceRef.current.getZoom())
      }
    }
  }

  const handleConfirm = async () => {
    let label = labelText
    if (!label || label === "Selected location") {
      const resolved = await getReadableLabel(markerPos.lat, markerPos.lng)
      label = resolved || label || `${markerPos.lat.toFixed(4)}, ${markerPos.lng.toFixed(4)}`
    }
    onConfirm(markerPos.lat, markerPos.lng, label)
  }

  if (!showModal) return null

  return (
    <div className="map-modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="map-backdrop" onClick={onClose} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }} />
      <div className="map-content" style={{
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div className="map-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Pin your exact location</h3>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>Search manually or drop the pin on the map.</p>
          </div>
          <button 
            className="map-close" 
            onClick={onClose} 
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1,
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div className="map-search" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="Search location (area, city, landmark)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searching && <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', display: 'block' }}>Searching...</span>}
        </div>

        {searchResults.length > 0 && (
          <div className="map-results" style={{
            borderBottom: '1px solid #e5e7eb',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {searchResults.map((item, idx) => (
              <button
                key={`${item.address}-${idx}`}
                className="map-result-item"
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  border: 'none',
                  background: 'white',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderBottom: idx < searchResults.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <span style={{ display: 'block', fontWeight: 500, fontSize: '14px' }}>{item.title}</span>
                {item.subtitle && (
                  <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{item.subtitle}</span>
                )}
              </button>
            ))}
          </div>
        )}
        
        <div ref={containerRef} className="map-info" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          {!editing ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: 'wrap' }}>
              <div className="map-label" style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>
                {labelText || "Finding location..."}
              </div>
              <button 
                className="btn btn-ghost" 
                onClick={() => setEditing(true)} 
                style={{ 
                  padding: '6px 12px',
                  fontSize: '13px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                className="map-label-input" 
                defaultValue={labelText} 
                onChange={(e) => setLabelText(e.target.value)} 
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
              <button 
                className="btn btn-primary" 
                onClick={() => setEditing(false)}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>
        
        <div 
          ref={mapRef} 
          id="map" 
          style={{ 
            width: "100%", 
            height: "350px", 
            borderRadius: 0,
            backgroundColor: '#f3f4f6'
          }} 
        />

        {!apiKey && (
          <p style={{ fontSize: 12, color: "#666", padding: '12px 20px', margin: 0, background: '#fef3c7' }}>
            Google Maps API key not found. Using OpenStreetMap to pick location — click Confirm to use coordinates.
          </p>
        )}

        <div className="map-actions" style={{
          display: 'flex',
          gap: '12px',
          padding: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button 
            onClick={onClose} 
            className="btn btn-ghost"
            style={{
              flex: 1,
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Confirm location
          </button>
        </div>
      </div>
    </div>
  )
}

