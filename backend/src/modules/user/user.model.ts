import mongoose, { Schema, Document, Types } from 'mongoose';

// --- User ---
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  daily_tokens_used: number;
  daily_tokens_date: string;
  created_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    daily_tokens_used: { type: Number, default: 0 },
    daily_tokens_date: { type: String, required: true }, 
    created_at: { type: Date, default: Date.now },
  }
);

export const User = mongoose.model<IUser>('User', userSchema);

// --- Profile ---
export interface IProfile extends Document {
  user_id: Types.ObjectId;
  weight_kg: number;
  height_cm?: number;
  age?: number;
  goal?: 'weight_loss' | 'maintenance' | 'weight_gain';
  activity_level?: 'sedentary' | 'moderate' | 'active';
}

const profileSchema = new Schema<IProfile>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  weight_kg: { type: Number, default: 70 },
  height_cm: { type: Number },
  age: { type: Number },
  goal: { type: String, enum: ['weight_loss', 'maintenance', 'weight_gain'] },
  activity_level: { type: String, enum: ['sedentary', 'moderate', 'active'] },
});

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);
