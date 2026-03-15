import mongoose, { Schema, model, models } from "mongoose"

export interface IComment {
  id: string
  content: string
  authorName: string
  authorRole: string
  createdBy: string
  createdAt: Date
}

export interface IComplaint {
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "pending" | "resolved"
  createdBy: string
  comments: IComment[]
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
    },
    authorName: {
      type: String,
      required: [true, "Author name is required"],
    },
    authorRole: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: [true, "CreatedBy is required"],
    },
  },
  {
    timestamps: true,
  }
)

const ComplaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    createdBy: {
      type: String,
      required: [true, "CreatedBy is required"],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Complaint = models.Complaint || model<IComplaint>("Complaint", ComplaintSchema)

export default Complaint
