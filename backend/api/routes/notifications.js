// Notification Routes (v2) - with batch operations
const express = require('express');

module.exports = function (supabase) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { type, unread_only, limit = 50 } = req.query;
      let query = supabase.from('notifications').select('*')
        .eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(parseInt(limit));
      if (type) query = query.eq('type', type);
      if (unread_only === 'true') query = query.eq('is_read', false);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });

      // Also get unread count
      const { count } = await supabase.from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', req.user.id).eq('is_read', false);

      res.json({ notifications: data, unread_count: count || 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark single as read
  router.patch('/:id/read', async (req, res) => {
    try {
      const { data, error } = await supabase.from('notifications')
        .update({ is_read: true }).eq('id', req.params.id)
        .eq('user_id', req.user.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark all as read
  router.patch('/read-all', async (req, res) => {
    try {
      const { error } = await supabase.from('notifications')
        .update({ is_read: true }).eq('user_id', req.user.id).eq('is_read', false);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'All marked as read' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete old notifications
  router.delete('/clear-read', async (req, res) => {
    try {
      const { error } = await supabase.from('notifications')
        .delete().eq('user_id', req.user.id).eq('is_read', true);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Read notifications cleared' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
