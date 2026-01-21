import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { registerSchema, loginSchema } from '../validators';
import { AuthRequest } from '../types';
import { JWT_SECRET, COOKIE_MAX_AGE } from '../utils/constants';
import { sendError, sendSuccess } from '../utils/response';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
};

const userSelect = { id: true, email: true, name: true };

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) return sendError(res, 'Email already registered', 400);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { email: data.email, password: hashedPassword, name: data.name },
      select: userSelect,
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    return sendSuccess(res, { user }, 201);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return sendError(res, 'Invalid input data', 400);
    }
    return sendError(res, 'Internal server error', 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return sendError(res, 'Invalid credentials', 401);

    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) return sendError(res, 'Invalid credentials', 401);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    setAuthCookie(res, token);
    return sendSuccess(res, { user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return sendError(res, 'Invalid input data', 400);
    }
    return sendError(res, 'Internal server error', 500);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  return sendSuccess(res, { message: 'Logged out successfully' });
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: userSelect,
    });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, { user });
  } catch {
    return sendError(res, 'Internal server error', 500);
  }
}
