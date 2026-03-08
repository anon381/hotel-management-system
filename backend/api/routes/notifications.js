// Notification Routes
const express = require('express');

module.exports = function (supabase) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark as read
  router.patch('/:id/read', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mark all as read
  router.patch('/read-all', async (req, res) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', req.user.id)
        .eq('is_read', false);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
