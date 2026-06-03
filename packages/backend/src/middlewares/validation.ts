import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
    return;
  }
  next();
};

export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 100 }),
  body('password').isLength({ min: 8 }),
  body('firstName').optional().isLength({ max: 100 }),
  body('lastName').optional().isLength({ max: 100 }),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const validatePrompt = [
  body('title').isLength({ min: 1, max: 255 }),
  body('content').isLength({ min: 1 }),
  body('aiModel').isIn(['chatgpt', 'gemini', 'claude', 'grok', 'deepseek', 'llama', 'mistral']),
  body('category').optional().isLength({ max: 100 }),
];
