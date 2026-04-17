import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMacros {
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

export interface IFoodCache extends Document {
  query: string;
  calories_min: number;
  calories_max: number;
  macros: IMacros;
  source: 'edamam' | 'local_db';
  is_local: boolean;
  fetched_at: Date;
}

const foodCacheSchema = new Schema<IFoodCache>({
  query: { type: String, required: true, unique: true, lowercase: true },
  calories_min: { type: Number, required: true },
  calories_max: { type: Number, required: true },
  macros: {
    protein_g: { type: Number, required: true },
    fat_g: { type: Number, required: true },
    carbs_g: { type: Number, required: true },
  },
  source: { type: String, enum: ['edamam', 'local_db'], required: true },
  is_local: { type: Boolean, required: true },
  fetched_at: { type: Date, default: Date.now },
});

// TTL Index: 7 days (604800 seconds)
foodCacheSchema.index({ fetched_at: 1 }, { expireAfterSeconds: 604800 });

export const FoodCache = mongoose.model<IFoodCache>('FoodCache', foodCacheSchema);
