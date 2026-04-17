import { IProfile } from '../user/user.model';

export interface ActivityRecommendation {
  type: string;
  duration_minutes: number;
}

export interface RecommendationResult {
  consumption_time: string;
  frequency: string;
  activities: ActivityRecommendation[];
  disclaimer: string;
}

const MET: Record<string, number> = {
  walking: 4.5,
  running: 9.8,
  badminton: 7.0,
  cycling: 7.5,
};

const activityDuration = (totalCalories: number, met: number, weightKg: number): number => {
  return Math.round(totalCalories / ((met * weightKg) / 60));
};

export const generate = async (
  totalCalories: number,
  userProfile: Partial<IProfile> | null
): Promise<RecommendationResult> => {
  const weightKg = userProfile?.weight_kg || 70;

  const activities = Object.entries(MET).map(([type, met]) => ({
    type,
    duration_minutes: activityDuration(totalCalories, met, weightKg),
  }));

  const disclaimer =
    'This system provides general health guidance only and is not a substitute for medical advice. Calorie values are approximate. Activity recommendations are based on population averages and your stated profile. Consult a qualified health professional for personalised dietary guidance.';

  return {
    consumption_time: 'Standard meal time',
    frequency: 'Moderate consumption advised',
    activities,
    disclaimer,
  };
};
