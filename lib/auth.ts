import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "ID", type: "text" },
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials) return null

        // Use the name from the login form
        const userName = credentials.name || credentials.id

        const role: "student" | "faculty" | "superadmin" =
          credentials.id === "2305029"
            ? "superadmin"
            : (credentials.role as "student" | "faculty" | "superadmin") || "student"

        return {
          id: credentials.id,
          name: userName,
          email: "",
          role
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key",
  session: {
    strategy: "jwt" as const
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role || "student"
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user.id = token.id
      session.user.role = token.role || "student"
      session.user.name = token.name
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions)

// User type and helper functions
export interface User {
  id: string
  name: string
  studentId?: string
  facultyId?: string
  email: string
  role: "student" | "faculty" | "superadmin"
}

export function getUserId(user: User): string {
  return user.role === "student" ? user.studentId || "" : user.facultyId || ""
}

export function validateUserInput(name: string, id: string, email: string, role: "student" | "faculty" | "superadmin"): string | null {
  // Trim inputs
  const trimmedName = name.trim()
  const trimmedId = id.trim()
  const trimmedEmail = email.trim()

  // Validate name
  if (!trimmedName || trimmedName.length === 0) {
    return "Please enter your full name"
  }

  // Validate ID
  if (!trimmedId || trimmedId.length === 0) {
    return role === "student" ? "Please enter your student ID" : "Please enter your faculty ID / employee ID"
  }

  // Validate email
  if (!trimmedEmail || trimmedEmail.length === 0) {
    return "Please enter your email address"
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return "Please enter a valid email address"
  }

  return null
}
