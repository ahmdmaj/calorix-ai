import { Request, Response } from 'express';
import { User, Profile } from '../user/user.model';
import { hashPassword, verifyPassword, generateToken } from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ status: 'error', message: 'Email already in use' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    
    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      daily_tokens_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    });

    // Create empty Profile
    await Profile.create({
      user_id: user._id,
    });

    const token = generateToken(user._id.toString());

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ status: 'success', message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ status: 'success', message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('token');
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
