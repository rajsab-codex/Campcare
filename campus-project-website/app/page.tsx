import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, FileWarning, Search, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShieldAlert className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CampCare</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Contact
            </Link>
            <Link href="/dashboard">
              <Button>
                Login / Signup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <ShieldAlert className="h-4 w-4" />
            Campus Management System
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Your Complete Campus
            <span className="text-primary"> Safety & Support</span> Hub
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            A unified platform for campus complaints, lost & found management, and women safety services. Built for
            students, by students.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Three Powerful Modules, One Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a safer, more organized campus experience
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card border-border hover:border-primary/50 transition-all group">
              <CardContent className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                  <FileWarning className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Campus Complaint System</h3>
                <p className="text-muted-foreground mb-4">
                  Report and track issues related to infrastructure, academics, hostel, canteen, and transportation with
                  real-time status updates.
                </p>
                <ul className="space-y-2">
                  {["Category-based filing", "Image attachments", "Status tracking", "Admin resolution"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-all group">
              <CardContent className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                  <Search className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Lost & Found Module</h3>
                <p className="text-muted-foreground mb-4">
                  Lost something on campus? Found an item? Our lost & found system helps reunite items with their
                  rightful owners quickly.
                </p>
                <ul className="space-y-2">
                  {["Post lost/found items", "Image uploads", "Location tagging", "Contact owner/finder"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-sos/30 hover:border-sos/50 transition-all group">
              <CardContent className="p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sos/10 mb-6 group-hover:bg-sos/20 transition-colors">
                  <ShieldAlert className="h-7 w-7 text-sos" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Women Safety SOS</h3>
                <p className="text-muted-foreground mb-4">
                  Emergency SOS system with one-tap alerts, location sharing, and quick access to emergency contacts and
                  safety guidelines.
                </p>
                <ul className="space-y-2">
                  {["One-tap SOS button", "Location sharing", "Emergency contacts", "Safety guidelines"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-sos" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:px-12 bg-primary/5">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Make Your Campus Safer?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students using CampCare to report issues, find lost items, and stay safe on campus.
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              Access Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <ShieldAlert className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">CampCare</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 CampCare. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
