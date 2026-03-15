import mongoose, { Schema, model, models } from "mongoose"

export interface IComment {
  complaintId: mongoose.Types.ObjectId
  message: string
  createdBy: string  // userId
  userName: string  // name shown in UI
  role: "student" | "faculty" | "superadmin"
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: [true, "Complaint ID is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    createdBy: {
      type: String,
      required: [true, "CreatedBy is required"],
    },
    userName: {
      type: String,
      required: [true, "Display name is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["student", "faculty", "superadmin"],
    },
  },
  {
    timestamps: true,
  }
)

const Comment = models.Comment || model<IComment>("Comment", CommentSchema)

export default Comment
