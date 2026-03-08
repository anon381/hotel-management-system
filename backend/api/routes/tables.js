// Table Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('is_active', true)
        .order('table_number');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/:id', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables').update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
