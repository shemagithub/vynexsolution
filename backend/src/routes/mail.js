import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  deleteMailMessage,
  getMailMessage,
  isMailConfigured,
  listMailFolders,
  listMailMessages,
  saveDraft,
  sendMailMessage,
  updateMailFlags,
} from '../services/mail.js';

const router = Router();

router.get(
  '/status',
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({ configured: isMailConfigured() });
  })
);

router.get(
  '/folders',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const data = await listMailFolders();
    res.json(data);
  })
);

router.get(
  '/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await listMailMessages(req.query.folder, {
      limit: Number(req.query.limit) || 40,
      page: Number(req.query.page) || 1,
      query: req.query.q || '',
    });
    res.json(data);
  })
);

router.get(
  '/messages/:uid',
  requireAuth,
  asyncHandler(async (req, res) => {
    const message = await getMailMessage(req.query.folder, req.params.uid);
    res.json(message);
  })
);

router.patch(
  '/messages/:uid',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await updateMailFlags(req.query.folder, req.params.uid, req.body);
    res.json(result);
  })
);

router.delete(
  '/messages/:uid',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await deleteMailMessage(req.query.folder, req.params.uid);
    res.json(result);
  })
);

router.post(
  '/send',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { to, cc, bcc, subject, text, html, inReplyTo, references } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Recipient and subject are required' });
    }

    const result = await sendMailMessage({
      to,
      cc,
      bcc,
      subject,
      text: text || '',
      html,
      inReplyTo,
      references,
    });
    res.json(result);
  })
);

router.post(
  '/drafts',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await saveDraft(req.body);
    res.json(result);
  })
);

export default router;
