import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  title: string;
  tags: string[];
  creator: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  members: mongoose.Types.ObjectId[];
  expiresAt: Date;
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  tags: [
    {
      type: String,
      trim: true,
      maxlength: 20,
    },
  ],
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
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

roomSchema.index({ location: "2dsphere" });

export const Room = mongoose.model<IRoom>("Room", roomSchema);
