import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFoodItem {
  name: string;
  calories_min: number;
  calories_max: number;
  source: string;
}

export interface IActivity {
  type: string;
  duration_minutes: number;
}

export interface IChatResult {
  food_items: IFoodItem[];
  total_min: number;
  total_max: number;
  consumption_time: string;
  frequency: string;
  activities: IActivity[];
  health_note: string;
  disclaimer: string;
}

export interface IChat extends Document {
  user_id: Types.ObjectId;
  message: string;
  result: IChatResult;
  created_at: Date;
}

const chatSchema = new Schema<IChat>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  result: {
    food_items: [
      {
        name: { type: String, required: true },
        calories_min: { type: Number, required: true },
        calories_max: { type: Number, required: true },
        source: { type: String, required: true },
      },
    ],
    total_min: { type: Number, required: true },
    total_max: { type: Number, required: true },
    consumption_time: { type: String, required: true },
    frequency: { type: String, required: true },
    activities: [
      {
        type: { type: String, required: true },
        duration_minutes: { type: Number, required: true },
      },
    ],
    health_note: { type: String, required: true },
    disclaimer: { type: String, required: true },
  },
  created_at: { type: Date, default: Date.now },
});

// TTL Index: expire after 90 days (7776000 seconds)
chatSchema.index({ created_at: 1 }, { expireAfterSeconds: 7776000 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
