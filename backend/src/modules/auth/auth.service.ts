import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
  // Token valid for 7 days
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};
