// Table Routes (v2)
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { zone, status } = req.query;
      let query = supabase.from('restaurant_tables').select('*').eq('is_active', true).order('table_number');
      if (zone) query = query.eq('zone', zone);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get table with current reservation/order info
  router.get('/:id', async (req, res) => {
    try {
      const { data: table } = await supabase.from('restaurant_tables')
        .select('*').eq('id', req.params.id).single();

      const today = new Date().toISOString().substring(0, 10);
      const { data: reservations } = await supabase.from('reservations')
        .select('*, profiles(full_name)')
        .eq('table_id', req.params.id).eq('reservation_date', today)
        .in('status', ['confirmed', 'pending']).order('reservation_time');

      const { data: currentOrder } = await supabase.from('orders')
        .select('*, order_items(item_name, quantity)')
        .eq('table_id', req.params.id).in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: false }).limit(1);

      res.json({ ...table, todays_reservations: reservations, current_order: currentOrder?.[0] || null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('restaurant_tables').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('restaurant_tables')
        .update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
      const { error } = await supabase.from('restaurant_tables')
        .update({ is_active: false }).eq('id', req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Table deactivated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

// noop: harmless touch