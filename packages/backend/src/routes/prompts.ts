import { Router, Request, Response } from 'express';
import { authMiddleware } from '@middlewares/auth';
import { query } from '@config/database';
import { logger } from '@utils/logger';

const router = Router();

// Create a prompt
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      content,
      aiModel,
      category,
      tags,
      isPublic,
    } = req.body;

    const result = await query(
      `INSERT INTO prompts (user_id, title, description, content, ai_model, category, tags, is_public, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
       RETURNING *`,
      [req.userId, title, description || null, content, aiModel, category || null, tags || null, isPublic || false],
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error creating prompt', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get prompt by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM prompts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Prompt not found' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error fetching prompt', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update prompt
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, description, content, aiModel, category, tags, isPublic } = req.body;

    const result = await query(
      `UPDATE prompts SET title=$1, description=$2, content=$3, ai_model=$4, category=$5, tags=$6, is_public=$7, updated_at=CURRENT_TIMESTAMP WHERE id=$8 AND user_id=$9 RETURNING *`,
      [title, description || null, content, aiModel, category || null, tags || null, isPublic || false, req.params.id, req.userId],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Prompt not found or access denied' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error updating prompt', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete prompt
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM prompts WHERE id=$1 AND user_id=$2 RETURNING *', [req.params.id, req.userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Prompt not found or access denied' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    logger.error('Error deleting prompt', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// List prompts with pagination and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', pageSize = '20', aiModel, q, userId } = req.query as Record<string, string>;
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

    const filters = [] as string[];
    const params = [] as unknown[];
    let idx = 1;

    if (aiModel) {
      filters.push(`ai_model = $${idx}`);
      params.push(aiModel);
      idx++;
    }
    if (userId) {
      filters.push(`user_id = $${idx}`);
      params.push(userId);
      idx++;
    }
    if (q) {
      filters.push(`(title ILIKE $${idx} OR description ILIKE $${idx} OR content ILIKE $${idx})`);
      params.push(`%${q}%`);
      idx++;
    }

    let where = '';
    if (filters.length > 0) where = 'WHERE ' + filters.join(' AND ');

    const dataQuery = `SELECT * FROM prompts ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(parseInt(pageSize, 10));
    params.push(offset);

    const result = await query(dataQuery, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    logger.error('Error listing prompts', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
