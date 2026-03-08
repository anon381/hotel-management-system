// Inventory Routes (v2) - with restock log
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  router.get('/', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { low_stock_only, category, search } = req.query;
      let query = supabase.from('inventory').select('*').order('name');
      if (low_stock_only === 'true') query = query.eq('is_low_stock', true);
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('name', `%${search}%`);
      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('inventory').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'inventory_item_created', 'inventory', data.id, { name: data.name });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/:id', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('inventory')
        .update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'inventory_item_deleted', 'inventory', req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Restock with log
  router.post('/:id/restock', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { quantity, notes } = req.body;
      const { data: current } = await supabase.from('inventory')
        .select('quantity, cost_per_unit').eq('id', req.params.id).single();

      const newQty = parseFloat(current.quantity) + parseFloat(quantity);
      const { data, error } = await supabase.from('inventory')
        .update({ quantity: newQty, last_restocked: new Date().toISOString() })
        .eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Log the restock
      await supabase.from('inventory_restock_log').insert({
        inventory_id: req.params.id,
        quantity_added: quantity,
        cost_total: parseFloat(quantity) * parseFloat(current.cost_per_unit || 0),
        restocked_by: req.user.id,
        notes,
      });

      await logActivity(req.user.id, 'inventory_restocked', 'inventory', req.params.id, { quantity_added: quantity });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Restock history
  router.get('/:id/restock-history', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('inventory_restock_log')
        .select('*, profiles(full_name)')
        .eq('inventory_id', req.params.id)
        .order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
