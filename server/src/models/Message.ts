import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  room: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  expiresAt: Date;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  room: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ room: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
