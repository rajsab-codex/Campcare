"use client"

import { useState, useRef, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const quickActions = [
  "How do I file a complaint?",
  "Check complaint status",
  "Report a lost item",
  "Post a found item",
  "Emergency SOS",
  "Safe zones",
]

const botResponses: Record<string, string> = {
  // Complaint related
  "how do i file a complaint?": `📝 To file a complaint:
1. Go to Dashboard → Complaints
2. Click "New Complaint"
3. Select a category:
   • Infrastructure (buildings, electricity, water)
   • Academic (classes, exams, faculty)
   • Hostel (rooms, mess, facilities)
   • Canteen (food quality, hygiene)
   • Transport (bus timing, routes)
   • Other
4. Choose priority: Low, Medium, High, or Critical
5. Provide a detailed description
6. Optionally attach an image
7. Submit your complaint

Your complaint will be assigned a tracking ID and you can monitor its status from the Complaints page.`,

  "check complaint status": `📋 To check your complaint status:
1. Go to Dashboard → Complaints
2. Find your complaint in the list
3. Check the status column:
   • 🟡 Pending - Under review
   • 🔵 In-Progress - Being worked on
   • ✅ Resolved - Issue fixed

You can also click on any complaint to view detailed updates and add comments.`,

  "complaint categories": `📂 Complaint Categories:
• Infrastructure - Buildings, electricity, water, furniture
• Academic - Classes, exams, faculty issues
• Hostel - Rooms, mess, facilities, cleanliness
• Canteen - Food quality, hygiene, pricing
• Transport - Bus timing, routes, availability
• Other - Anything else

Select the most relevant category when filing your complaint for faster resolution.`,

  "complaint priorities": `⚡ Complaint Priority Levels:
• Low - Minor issues, can wait
• Medium - Needs attention within a week
• High - Important, resolve within 2-3 days
• Critical - Urgent, needs immediate action

Faculty/admins will prioritize based on urgency. Critical issues get fastest response!`,

  "comments on complaints": `💬 To add a comment on a complaint:
1. Open the complaint you want to comment on
2. Scroll down to the Comments section
3. Type your message in the comment box
4. Click the Submit or Post button

Note: Any logged-in user can add comments, but only faculty can change the complaint status!`,

  // Lost & Found related
  "report a lost item": `🔍 To report a lost item:
1. Navigate to Dashboard → Lost & Found
2. Click "Post Item"
3. Select "Lost" as the type
4. Provide item details:
   • Item name & description
   • Category (Bags, Accessories, Documents, Electronics, etc.)
   • Last known location
5. Add your contact information
6. Submit the report

You'll be notified if someone finds your item!`,

  "post a found item": `📦 To post a found item:
1. Navigate to Dashboard → Lost & Found
2. Click "Post Item"
3. Select "Found" as the type
4. Provide item details:
   • Item name & description
   • Category (Bags, Accessories, Documents, Electronics, etc.)
   • Where you found it
5. Add your contact information
6. Submit the post

The owner can contact you to claim the item!`,

  "lost & found categories": `🏷️ Lost & Found Categories:
• Bags - Backpacks, laptop bags, wallets
• Accessories - Watches, jewelry, glasses
• Documents - ID cards, certificates, books
• Electronics - Phones, chargers, calculators
• Clothing - Jackets, uniforms
• Other - Anything else

Include clear descriptions and photos for better chances of recovery!`,

  "mark item as found": `✅ To mark an item as found/resolved:
1. Go to Dashboard → Lost & Found
2. Find your posted item
3. Click on the item to open details
4. Click "Mark as Found" button
5. Confirm the resolution

This helps others know the item has been recovered!`,

  // Emergency & Safety
  "emergency contacts": `📞 Emergency Contacts:
• Campus Security: 100 (24/7)
• Women Helpline: 181
• Police Emergency: 112
• Campus Medical: +91 98765 11111
• Anti-Ragging Cell: +91 98765 22222

For immediate SOS assistance, visit the Women Safety section!`,

  "emergency sos": `🚨 Emergency SOS Activation:
1. Go to Dashboard → Women Safety SOS
2. Press the large SOS button
3. Confirm the alert
4. Your location is shared with security
5. Emergency contacts are notified

The SOS system:
• Alerts campus security immediately
• Shares your GPS location
• Sends WhatsApp message with location to emergency contacts
• Provides one-tap call to police`,

  "safety guidelines": `🛡️ Safety Guidelines:
• Share live location with trusted contacts
• Save emergency numbers on speed dial
• Avoid isolated areas after dark
• Report suspicious activity to security
• Use well-lit routes on campus
• Keep hostel room locked
• Inform security before leaving late
• Always carry your ID card
• Stay in groups when possible
• Know the location of security booths`,

  "safe zones": `🗺️ Safe Zones on Campus:
Security booths are located at:
• Main Gate - Staffed 24/7
• Library Entrance - Staffed 24/7
• Hostel Gate - Staffed 24/7
• Sports Complex - Staffed 24/7
• Academic Block - Staffed 24/7

Each booth is equipped with:
• Emergency response systems
• First aid kits
• Direct line to campus security
• Safe waiting areas

In any emergency, head to the nearest security booth!`,

  default: `Hello! 👋 I'm your CampCare assistant. I can help you with:

📝 Complaints
• How to file, check status, add comments
• Categories and priorities

🔍 Lost & Found
• Report lost items, post found items
• Categories and recovery tips

🚨 Emergency
• SOS activation
• Emergency contacts
• Safety guidelines
• Safe zones on campus

Try asking me something or use the quick action buttons below!`,
}

export const ChatbotWidget = memo(function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: botResponses["default"],
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const lowerText = text.toLowerCase()
    let response = botResponses["default"]

    for (const [key, value] of Object.entries(botResponses)) {
      if (lowerText.includes(key) || key.includes(lowerText)) {
        response = value
        break
      }
    }

    // Check for specific keywords - Priority order matters!
    
    // SOS / Emergency keywords
    if (lowerText.includes("sos") || lowerText.includes("emergency") || lowerText.includes("panic") || lowerText.includes("urgent help")) {
      response = botResponses["emergency sos"]
    }
    // Safe zones
    else if (lowerText.includes("safe zone") || lowerText.includes("security booth") || lowerText.includes("safe place") || lowerText.includes("where is security")) {
      response = botResponses["safe zones"]
    }
    // Safety guidelines
    else if (lowerText.includes("safety") && (lowerText.includes("tip") || lowerText.includes("guideline") || lowerText.includes("how to stay safe"))) {
      response = botResponses["safety guidelines"]
    }
    // Emergency contacts
    else if (lowerText.includes("emergency contact") || lowerText.includes("contact") || lowerText.includes("helpline") || lowerText.includes("phone number")) {
      response = botResponses["emergency contacts"]
    }
    // Complaint status
    else if (lowerText.includes("complaint") && (lowerText.includes("status") || lowerText.includes("track") || lowerText.includes("check") || lowerText.includes("progress") || lowerText.includes("update"))) {
      response = botResponses["check complaint status"]
    }
    // Complaint categories
    else if (lowerText.includes("complaint") && (lowerText.includes("category") || lowerText.includes("type") || lowerText.includes("what kind"))) {
      response = botResponses["complaint categories"]
    }
    // Complaint priorities
    else if (lowerText.includes("complaint") && (lowerText.includes("priority") || lowerText.includes("urgent") || lowerText.includes("important") || lowerText.includes("critical"))) {
      response = botResponses["complaint priorities"]
    }
    // Comments on complaints
    else if (lowerText.includes("comment") || lowerText.includes("add comment") || lowerText.includes("who can comment") || lowerText.includes("can i comment") || lowerText.includes("how do comments work")) {
      response = botResponses["comments on complaints"]
    }
    // File/submit complaint
    else if (lowerText.includes("complaint") || lowerText.includes("complain") || (lowerText.includes("file") && lowerText.includes("complaint")) || (lowerText.includes("submit") && lowerText.includes("complaint")) || lowerText.includes("report issue")) {
      response = botResponses["how do i file a complaint?"]
    }
    // Lost & Found categories
    else if ((lowerText.includes("lost") || lowerText.includes("found")) && (lowerText.includes("category") || lowerText.includes("type") || lowerText.includes("kind"))) {
      response = botResponses["lost & found categories"]
    }
    // Mark item as found/resolved
    else if (lowerText.includes("mark") && (lowerText.includes("found") || lowerText.includes("resolved") || lowerText.includes("close"))) {
      response = botResponses["mark item as found"]
    }
    // Post found item
    else if (lowerText.includes("found") && (lowerText.includes("post") || lowerText.includes("report") || lowerText.includes("submit") || lowerText.includes("item"))) {
      response = botResponses["post a found item"]
    }
    // Report lost item
    else if (lowerText.includes("lost") || lowerText.includes("missing") || lowerText.includes("cannot find")) {
      response = botResponses["report a lost item"]
    }
    // Help
    else if (lowerText.includes("help") || lowerText.includes("what can you do") || lowerText.includes("what do you know")) {
      response = botResponses["default"]
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    }
    setMessages((prev) => [...prev, botMessage])
    setIsTyping(false)
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isOpen ? "bg-secondary hover:bg-secondary/80" : "bg-primary hover:bg-primary/90",
        )}
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[400px] shadow-2xl border-border bg-card animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">CampCare Assistant</CardTitle>
                <p className="text-xs opacity-80">Always here to help</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-[300px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm whitespace-pre-line",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="border-t border-border p-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-transparent"
                    onClick={() => handleSend(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(input)
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-secondary border-border"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
})
