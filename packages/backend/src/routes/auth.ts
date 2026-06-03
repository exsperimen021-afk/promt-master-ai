import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { generateAccessToken } from '@utils/jwt';
import { query } from '@config/database';
import { validateRegister, validateLogin, validateRequest } from '@middlewares/validation';
import { authLimiter } from '@middlewares/rate-limit';
import { logger } from '@utils/logger';

const router = Router();

router.post('/register', authLimiter, validateRegister, validateRequest, async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    const existingUser = await query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Email or username already exists',
      });
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, username, password_hash, first_name, last_name, role, subscription_plan, credits_balance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, username, first_name, last_name, role, subscription_plan, credits_balance',
      [email, username, hashedPassword, firstName || null, lastName || null, 'user', 'free', 10],
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          subscriptionPlan: user.subscription_plan,
          creditsBalance: user.credits_balance,
        },
        accessToken,
      },
    });
  } catch (error) {
    logger.error('Error during registration', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.post('/login', authLimiter, validateLogin, validateRequest, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const user = result.rows[0];
    const validPassword = await bcryptjs.compare(password, user.password_hash);

    if (!validPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          subscriptionPlan: user.subscription_plan,
          creditsBalance: user.credits_balance,
        },
        accessToken,
      },
    });
  } catch (error) {
    logger.error('Error during login', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
