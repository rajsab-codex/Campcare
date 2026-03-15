import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "student" | "faculty" | "superadmin"
    } & DefaultSession["user"]
  }

  interface User {
    role?: "student" | "faculty" | "superadmin"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "student" | "faculty" | "superadmin"
  }
}
