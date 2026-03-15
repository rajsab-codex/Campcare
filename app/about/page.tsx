import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ShieldAlert,
  FileWarning,
  Search,
  Users,
  Target,
  Lightbulb,
  Code,
  Database,
  Layout,
} from "lucide-react"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { BackButton } from "@/components/back-button"
import { Suspense } from "react"

const technologies = [
  { name: "Next.js", icon: Code, description: "React Framework" },
  { name: "TypeScript", icon: Code, description: "Type Safety" },
  { name: "Tailwind CSS", icon: Layout, description: "Styling" },
  { name: "MongoDB", icon: Database, description: "Data Storage" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShieldAlert className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CampCare</span>
          </Link>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <BackButton />

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">About CampCare</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A comprehensive campus management system designed to make campus life safer, more organized, and
            student-friendly.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid gap-6 md:grid-cols-2 mb-16">
          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To create a unified platform that empowers students to report issues, find lost items, and access
                emergency services quickly and efficiently. We believe every student deserves a safe and supportive
                campus environment.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the go-to digital solution for campus management across educational institutions, setting new
                standards for student safety, communication, and administrative efficiency.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">System Modules</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <FileWarning className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Campus Complaint System</h3>
                <p className="text-sm text-muted-foreground">
                  A streamlined platform for students to report campus issues with category-based filing, image
                  attachments, and real-time status tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Lost & Found Module</h3>
                <p className="text-sm text-muted-foreground">
                  Helps students report lost items and post found items with detailed descriptions, images, and contact
                  information to facilitate reunification.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-sos/30">
              <CardContent className="p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sos/10 mb-4">
                  <ShieldAlert className="h-7 w-7 text-sos" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Women Safety SOS</h3>
                <p className="text-sm text-muted-foreground">
                  Emergency SOS system with one-tap alerts, location sharing, emergency contacts, and safety guidelines
                  for women on campus.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technologies */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Built With</h2>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {technologies.map((tech) => (
              <Card key={tech.name} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <tech.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">{tech.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Project Info */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">Developed for Campus Communities</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              CampCare is a comprehensive platform developed to enhance campus safety and efficiency. This project
              demonstrates proficiency in modern web development technologies and user-centered design principles.
            </p>
            <p className="text-sm text-muted-foreground">Version 1.0 © 2026</p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <ShieldAlert className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CampCare</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 CampCare. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  )
}
