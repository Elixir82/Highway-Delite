import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotes extends Document {
  title: string;
  content: string;
  User: Types.ObjectId; 
  createdAt?: Date;
  updatedAt?: Date;
}

const notesSchema = new Schema<INotes>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    User: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotes>('note', notesSchema);
