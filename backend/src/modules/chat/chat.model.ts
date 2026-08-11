import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number | null;
  protein_g: number | null;
  fat_g: number | null;
  carbs_g: number | null;
  fiber_g: number | null;
  source: string;
  confidence: string;
  warning?: string;
}

export interface IActivity {
  type: string;
  duration_minutes: number;
}

export interface IChatResult {
  food_items: IFoodItem[];
  total_min: number;
  total_max: number;
  total_protein_g: number;
  total_fat_g: number;
  total_carbs_g: number;
  consumption_time: string;
  frequency: string;
  activities: IActivity[];
  health_tips: string[];
  health_note: string;
  disclaimer: string;
  status: 'success' | 'needs_clarification' | 'error';
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
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        calories: { type: Number, required: false },
        protein_g: { type: Number, required: false },
        fat_g: { type: Number, required: false },
        carbs_g: { type: Number, required: false },
        fiber_g: { type: Number, required: false },
        source: { type: String, required: true },
        confidence: { type: String, required: true },
        warning: { type: String, required: false },
      },
    ],
    total_min: { type: Number, required: true },
    total_max: { type: Number, required: true },
    total_protein_g: { type: Number, required: true },
    total_fat_g: { type: Number, required: true },
    total_carbs_g: { type: Number, required: true },
    consumption_time: { type: String, required: true },
    frequency: { type: String, required: true },
    activities: [
      {
        type: { type: String, required: true },
        duration_minutes: { type: Number, required: true },
      },
    ],
    health_note: { type: String, required: true },
    health_tips: [{ type: String }],
    disclaimer: { type: String, required: true },
    status: { type: String, enum: ['success', 'needs_clarification', 'error'], required: true },
  },
  created_at: { type: Date, default: Date.now },
});

// TTL Index: expire after 7 days (604800 seconds)
chatSchema.index({ created_at: 1 }, { expireAfterSeconds: 604800 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
