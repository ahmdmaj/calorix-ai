import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Profile } from './user.model';
import { Chat } from '../chat/chat.model';
import mongoose from 'mongoose';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await Profile.findOne({ user_id: req.userId });
    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Profile not found' });
      return;
    }
    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { weight_kg, height_cm, age, goal, activity_level } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.userId },
      { $set: { weight_kg, height_cm, age, goal, activity_level } },
      { new: true, upsert: true }
    );

    res.status(200).json({ status: 'success', data: { profile } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await Chat.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(req.userId),
          created_at: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          total_min: { $sum: "$result.total_min" },
          total_max: { $sum: "$result.total_max" },
        },
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({ status: 'success', data: { stats } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
