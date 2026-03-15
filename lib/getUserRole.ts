/**
 * Helper function to determine user role based on userId and a user-selected role.
 * - userId "2305029" is always "superadmin".
 * - Otherwise, the role is determined by the `userSelectedRole` parameter.
 * - Defaults to "student" if `userSelectedRole` is not provided.
 */
export function getUserRole(userId: string, userSelectedRole?: string): "student" | "faculty" | "superadmin" {
  if (userId === "2305029") {
    return "superadmin"
  }

  if (userSelectedRole === "faculty") {
    return "faculty"
  }
  
  if (userSelectedRole === "student") {
    return "student"
  }

  return "student"
}
