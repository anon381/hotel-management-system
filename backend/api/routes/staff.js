// Staff Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  router.get('/', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('staff').select('*').order('full_name');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('staff').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/:id', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('staff').update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
      const { error } = await supabase.from('staff').delete().eq('id', req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Staff member removed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
