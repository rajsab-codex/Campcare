// Types for the campus management system
export type ComplaintStatus = "pending" | "in-progress" | "resolved"
export type ComplaintCategory = "infrastructure" | "academic" | "hostel" | "canteen" | "transport" | "other"
export type ComplaintPriority = "low" | "medium" | "high" | "critical"

export interface Comment {
  id: string
  complaintId: string
  content: string
  message?: string  // Alternative name for content (used in some parts of the app)
  userName: string
  role: "student" | "faculty" | "superadmin"
  createdBy: string
  createdAt: string
}

// Alias for Comment (for backward compatibility)
export type IComment = Comment

export interface Complaint {
  id: string
  title: string
  description: string
  category: ComplaintCategory
  status: ComplaintStatus
  priority: ComplaintPriority
  imageUrl?: string
  studentName: string
  studentId: string
  createdAt: string
  updatedAt: string
  comments?: Comment[]
}

export type ItemType = "lost" | "found"
export type ItemStatus = "active" | "found" | "resolved"

export interface LostFoundItem {
  id: string
  type: ItemType
  title: string
  description: string
  category: string
  location: string
  date: string
  imageUrl?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  createdAt: string
  createdBy: string
  status: ItemStatus
}

export interface User {
  id: string
  name: string
  email: string
  role: "student" | "faculty"
  studentId?: string
  department?: string
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  description: string
}

// Mock data for complaints
export const mockComplaints: Complaint[] = [
  {
    id: "c1",
    title: "Broken AC in Lecture Hall 201",
    description:
      "The air conditioning unit in Lecture Hall 201 has not been working for the past week. Students are finding it difficult to concentrate during lectures due to the heat.",
    category: "infrastructure",
    status: "in-progress",
    priority: "high",
    studentName: "Rahul Sharma",
    studentId: "CS2021045",
    createdAt: "2026-01-10T10:30:00Z",
    updatedAt: "2026-01-12T14:20:00Z",
  },
  {
    id: "c2",
    title: "Poor Food Quality in Main Canteen",
    description:
      "The food quality in the main canteen has deteriorated significantly. Several students have reported stomach issues after eating there.",
    category: "canteen",
    status: "pending",
    priority: "medium",
    studentName: "Priya Patel",
    studentId: "EC2022018",
    createdAt: "2026-01-13T09:15:00Z",
    updatedAt: "2026-01-13T09:15:00Z",
  },
  {
    id: "c3",
    title: "Water Leakage in Boys Hostel Block B",
    description:
      "There is severe water leakage from the ceiling in Room 304 of Boys Hostel Block B. The issue has been recurring and needs immediate attention.",
    category: "hostel",
    status: "resolved",
    priority: "critical",
    studentName: "Amit Kumar",
    studentId: "ME2020087",
    createdAt: "2026-01-05T16:45:00Z",
    updatedAt: "2026-01-08T11:30:00Z",
  },
  {
    id: "c4",
    title: "Bus Timing Issues",
    description:
      "The college bus on Route 5 has been arriving 20-30 minutes late consistently for the past two weeks, causing students to miss their first lectures.",
    category: "transport",
    status: "pending",
    priority: "low",
    studentName: "Sneha Reddy",
    studentId: "IT2023012",
    createdAt: "2026-01-14T08:00:00Z",
    updatedAt: "2026-01-14T08:00:00Z",
  },
]

// Mock data for lost & found items
export const mockLostFoundItems: LostFoundItem[] = [
  {
    id: "lf1",
    type: "lost",
    title: "Blue Laptop Bag",
    description:
      "Dell laptop bag with a blue color. Contains important documents and a charger. Lost near the library entrance.",
    category: "Bags",
    location: "Central Library",
    date: "2026-01-12",
    contactName: "Vikram Singh",
    contactEmail: "vikram.singh@campus.edu",
    contactPhone: "+91 98765 43210",
    createdAt: "2026-01-12T14:30:00Z",
    createdBy: "CS2021045",
    status: "active",
  },
  {
    id: "lf2",
    type: "found",
    title: "Silver Wristwatch",
    description:
      "Found a silver analog wristwatch with a leather strap near the sports complex. Appears to be a branded watch.",
    category: "Accessories",
    location: "Sports Complex",
    date: "2026-01-11",
    contactName: "Admin Office",
    contactEmail: "admin@campus.edu",
    contactPhone: "+91 12345 67890",
    createdAt: "2026-01-11T16:00:00Z",
    createdBy: "admin",
    status: "active",
  },
  {
    id: "lf3",
    type: "lost",
    title: "Student ID Card",
    description: "Lost my student ID card somewhere in the campus. Name: Ananya Gupta, ID: BCA2024056",
    category: "Documents",
    location: "Unknown",
    date: "2026-01-13",
    contactName: "Ananya Gupta",
    contactEmail: "ananya.gupta@campus.edu",
    contactPhone: "+91 87654 32109",
    createdAt: "2026-01-13T10:20:00Z",
    createdBy: "BCA2024056",
    status: "active",
  },
  {
    id: "lf4",
    type: "found",
    title: "Scientific Calculator",
    description: "Casio FX-991ES Plus calculator found in Exam Hall 3 after the mathematics exam.",
    category: "Electronics",
    location: "Exam Hall 3",
    date: "2026-01-10",
    contactName: "Exam Cell",
    contactEmail: "examcell@campus.edu",
    contactPhone: "+91 11223 34455",
    createdAt: "2026-01-10T17:45:00Z",
    createdBy: "examcell",
    status: "resolved",
  },
]

// Emergency contacts
export const emergencyContacts: EmergencyContact[] = [
  {
    id: "e1",
    name: "Campus Security",
    phone: "100",
    description: "24/7 Campus Security Helpline",
  },
  {
    id: "e2",
    name: "Women Helpline",
    phone: "181",
    description: "National Women Helpline",
  },
  {
    id: "e3",
    name: "Police Emergency",
    phone: "112",
    description: "Emergency Police Services",
  },
  {
    id: "e4",
    name: "Campus Medical Center",
    phone: "+91 98765 11111",
    description: "On-campus Medical Emergency",
  },
  {
    id: "e5",
    name: "Anti-Ragging Cell",
    phone: "+91 98765 22222",
    description: "Report Ragging Incidents",
  },
]

// Safety guidelines
export const safetyGuidelines = [
  "Always share your live location with trusted contacts when traveling alone.",
  "Save emergency numbers on speed dial.",
  "Avoid isolated areas on campus after dark.",
  "Report any suspicious activity immediately to campus security.",
  "Use well-lit and populated routes while walking on campus.",
  "Keep your hostel room locked at all times.",
  "Inform security before leaving campus late at night.",
  "Carry your ID card at all times for identification.",
]
