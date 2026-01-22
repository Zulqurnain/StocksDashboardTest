import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid input data' });
  }
  return res.status(500).json({ error: 'Internal server error' });
}
