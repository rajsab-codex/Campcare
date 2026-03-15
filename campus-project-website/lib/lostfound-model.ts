import mongoose, { Schema, model, models } from "mongoose"

export interface IComment {
  id: string
  content: string
  authorName: string
  authorRole: string
  createdBy: string
  createdAt: Date
}

export interface ILostFound {
  type: "lost" | "found"
  itemName: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  date: string
  category: string
  contactName: string
  contactEmail: string
  contactPhone: string
  imageUrl: string
  status: "open" | "closed"
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

const LostFoundSchema = new Schema<ILostFound>(
  {
    type: {
      type: String,
      enum: ["lost", "found"],
      required: [true, "Type is required"],
    },
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
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

// Force delete cached model to ensure fresh schema is used
if (models.LostFound) {
  delete models.LostFound
}

const LostFound = model<ILostFound>("LostFound", LostFoundSchema)

export default LostFound
