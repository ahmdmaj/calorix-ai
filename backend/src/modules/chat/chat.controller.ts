import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Chat } from './chat.model';
import { Profile } from '../user/user.model';
import * as aiModule from '../ai/ai.service';
import * as nutritionModule from '../nutrition/nutrition.service';
import * as recommendModule from '../recommendation/recommendation.service';

export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.userId!;

    const userProfile = await Profile.findOne({ user_id: userId });

    const foodData = await aiModule.extract(message);
    const nutritionData = await nutritionModule.lookup(foodData.items);
    
    // Base recommendations on the upper bound of calorie limits for safety margin
    const recoData = await recommendModule.generate(nutritionData.total_max, userProfile);

    // Construct exactly mapping to Chat model schema
    const result = {
      food_items: nutritionData.food_items.map((item) => ({
        name: item.name,
        calories_min: item.calories_min || 0,
        calories_max: item.calories_max || 0,
        source: item.source,
      })),
      total_min: nutritionData.total_min,
      total_max: nutritionData.total_max,
      consumption_time: recoData.consumption_time,
      frequency: recoData.frequency,
      activities: recoData.activities,
      health_note: nutritionData.food_items.some(f => f.warning) ? 'Some foods missing exact data.' : 'Calorie values are estimates based on local databases.',
      disclaimer: recoData.disclaimer,
    };

    const chat = await Chat.create({
      user_id: userId,
      message,
      result,
    });

    res.status(200).json({ status: 'success', data: { chat } });
  } catch (error) {
    console.error('[createChat Error]:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chats = await Chat.find({ user_id: req.userId })
      .sort({ created_at: -1 })
      .limit(20);

    res.status(200).json({ status: 'success', data: { chats } });
  } catch (error) {
    console.error('[getChatHistory Error]:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const chat = await Chat.findOneAndDelete({ _id: id, user_id: req.userId });
    if (!chat) {
      res.status(404).json({ status: 'error', message: 'Chat not found' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Chat deleted' });
  } catch (error) {
    console.error('[deleteChat Error]:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
