import mongoose, { Schema, Document } from 'mongoose';

export interface UserI extends Document {
  name: string;
  email: string;
  dob: Date;
  authProvider: 'email' | 'google';
  isVerified: boolean;
  googleId?: string;
  // displayName?: string,
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<UserI>(
  {
    name: {
      type: String,
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
    dob: {
      type: Date,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<UserI>('user', userSchema);
export default UserModel;
