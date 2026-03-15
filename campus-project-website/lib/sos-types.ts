// SOS Alert Types

export type SOSStatus = "active" | "resolved"

export interface SOSAlert {
  id: string
  userId: string
  latitude: number
  longitude: number
  timestamp: string
  status: SOSStatus
}

export interface CreateSOSAlertRequest {
  latitude: number
  longitude: number
  userId?: string
}

export interface SOSAlertResponse {
  success: boolean
  data?: SOSAlert
  error?: string
}
