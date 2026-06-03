import { Router, Request, Response } from 'express';
import { authMiddleware } from '@middlewares/auth';
import { query } from '@config/database';
import { logger } from '@utils/logger';

const router = Router();

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, username, first_name, last_name, avatar_url, bio, role, subscription_plan, credits_balance, created_at FROM users WHERE id = $1',
      [req.userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        username: result.rows[0].username,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        avatarUrl: result.rows[0].avatar_url,
        bio: result.rows[0].bio,
        role: result.rows[0].role,
        subscriptionPlan: result.rows[0].subscription_plan,
        creditsBalance: result.rows[0].credits_balance,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    logger.error('Error fetching user profile', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, bio, avatarUrl } = req.body;

    const result = await query(
      'UPDATE users SET first_name = $1, last_name = $2, bio = $3, avatar_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, email, username, first_name, last_name, avatar_url, bio, role, subscription_plan, credits_balance',
      [firstName || null, lastName || null, bio || null, avatarUrl || null, req.userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        role: user.role,
        subscriptionPlan: user.subscription_plan,
        creditsBalance: user.credits_balance,
      },
    });
  } catch (error) {
    logger.error('Error updating user profile', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
