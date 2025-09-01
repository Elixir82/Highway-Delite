import mongoose, { Schema, Types, Document } from 'mongoose';

export interface Iopt extends Document {
  otp: number;
  email: string,
  expiresAt: Date;
}

const optSchema = new Schema<Iopt>(
  {
    otp: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid email address`,
      },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const optModel = mongoose.model<Iopt>('opt', optSchema);
export default optModel;
