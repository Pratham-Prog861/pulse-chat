import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ location: "2dsphere" });

export const User = mongoose.model<IUser>("User", userSchema);
