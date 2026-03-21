import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { getMessages } from './chat.service';

const router = Router();

router.use(authMiddleware);

router.get('/:matchId/messages', async (req, res, next) => {
  try {
    const msgs = await getMessages(
      req.params.matchId,
      req.userId!,
      req.query.before as string | undefined
    );
    res.json(msgs);
  } catch (err) {
    next(err);
  }
});

export default router;
