import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt';
import { logger } from '@utils/logger';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      userEmail?: string;
    }
  }
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization token');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new AppError(401, 'Invalid or expired token');
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied: admin only',
    });
    return;
  }
  next()
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        req.userEmail = decoded.email;
      }
    }
    next();
  } catch (error) {
    logger.warn('Optional auth failed', error);
    next();
  }
};
