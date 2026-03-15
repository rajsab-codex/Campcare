"use client"

import { useState, useRef, useEffect } from "react"
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

const quickActions = ["How do I file a complaint?", "Report a lost item", "Emergency contacts", "Safety guidelines"]

const botResponses: Record<string, string> = {
  "how do i file a complaint?": `To file a complaint:
1. Go to Dashboard → Complaints
2. Click "New Complaint"
3. Select a category (Infrastructure, Academic, Hostel, etc.)
4. Provide a detailed description
5. Optionally attach an image
6. Submit your complaint

Your complaint will be assigned a tracking ID and you can monitor its status from the Complaints page.`,

  "comments on complaints": `To add a comment on a complaint:
1. Open the complaint you want to comment on.
2. Scroll down to the Comments section.
3. Type your message in the comment box.
4. Click the Submit or Post button.

Any logged-in user can add comments. Comments don't change the complaint status—only faculty can do that!`,

  "report a lost item": `To report a lost item:
1. Navigate to Dashboard → Lost & Found
2. Click "Post Item"
3. Select "Lost" as the type
4. Provide item details (name, description, category)
5. Mention the last known location
6. Add your contact information
7. Submit the report

You'll be notified if someone finds your item!`,

  "emergency contacts": `📞 Emergency Contacts:
• Campus Security: 100 (24/7)
• Women Helpline: 181
• Police Emergency: 112
• Campus Medical: +91 98765 11111
• Anti-Ragging Cell: +91 98765 22222

For immediate SOS assistance, visit the Women Safety section and press the SOS button.`,

  "safety guidelines": `🛡️ Safety Guidelines:
• Share live location with trusted contacts
• Save emergency numbers on speed dial
• Avoid isolated areas after dark
• Report suspicious activity to security
• Use well-lit routes on campus
• Keep hostel room locked
• Inform security before leaving late
• Always carry your ID card`,

  default: `Hello! I'm your CampCare assistant. I can help you with:

• Filing complaints
• Lost & Found queries
• Emergency assistance
• Safety information

Try asking me something or use the quick action buttons below!`,
}

export function ChatbotWidget() {
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

    // Check for specific keywords
    if (lowerText.includes("complaint") || lowerText.includes("complain") || (lowerText.includes("file") && lowerText.includes("complaint")) || (lowerText.includes("submit") && lowerText.includes("complaint")) || lowerText.includes("report issue")) {
      response = botResponses["how do i file a complaint?"]
    } else if (lowerText.includes("lost") || lowerText.includes("found") || lowerText.includes("missing") || (lowerText.includes("report") && (lowerText.includes("lost") || lowerText.includes("found")))) {
      response = botResponses["report a lost item"]
    } else if (
      lowerText.includes("emergency") ||
      lowerText.includes("contact") ||
      lowerText.includes("help") ||
      lowerText.includes("sos")
    ) {
      response = botResponses["emergency contacts"]
    } else if (lowerText.includes("safe") || lowerText.includes("guideline") || lowerText.includes("tips")) {
      response = botResponses["safety guidelines"]
    } else if (
      lowerText.includes("comment") ||
      lowerText.includes("comments") ||
      lowerText.includes("add comment") ||
      lowerText.includes("who can comment") ||
      lowerText.includes("can i comment") ||
      lowerText.includes("change status") ||
      lowerText.includes("how do comments work")
    ) {
      response = botResponses["comments on complaints"]
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
}
