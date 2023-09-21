// Feedback Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Submit feedback
  router.post('/', async (req, res) => {
    try {
      const { type, rating, message } = req.body;
      if (!message) return res.status(400).json({ error: 'Message is required' });

      const { data, error } = await supabase.from('feedback')
        .insert({ customer_id: req.user.id, type: type || 'general', rating, message })
        .select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get my feedback
  router.get('/my', async (req, res) => {
    try {
      const { data, error } = await supabase.from('feedback')
        .select('*').eq('customer_id', req.user.id).order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: get all feedback
  router.get('/all', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { resolved } = req.query;
      let query = supabase.from('feedback')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });
      if (resolved === 'false') query = query.eq('is_resolved', false);
      if (resolved === 'true') query = query.eq('is_resolved', true);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: resolve feedback
  router.patch('/:id/resolve', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('feedback')
        .update({ is_resolved: true, resolved_by: req.user.id, resolved_at: new Date().toISOString() })
        .eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

// noop: harmless touch