// Inventory Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  router.get('/', requireRole('admin', 'kitchen_staff'), async (req, res) => {
    try {
      const { low_stock_only } = req.query;
      let query = supabase.from('inventory').select('*').order('name');
      if (low_stock_only === 'true') query = query.eq('is_low_stock', true);
      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('inventory').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/:id', requireRole('admin', 'kitchen_staff'), async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('inventory').update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Restock
  router.post('/:id/restock', requireRole('admin'), async (req, res) => {
    try {
      const { quantity } = req.body;
      const { data: current } = await supabase.from('inventory').select('quantity').eq('id', req.params.id).single();
      const { data, error } = await supabase
        .from('inventory')
        .update({ quantity: current.quantity + quantity, last_restocked: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
