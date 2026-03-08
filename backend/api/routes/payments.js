// Payment Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles').select('role').eq('user_id', req.user.id).in('role', ['admin']);

      let query = supabase.from('payments').select('*, orders(order_number, customer_id, total)').order('created_at', { ascending: false });

      if (!roles || roles.length === 0) {
        query = query.eq('orders.customer_id', req.user.id);
      }

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { order_id, amount, method } = req.body;
      const { data, error } = await supabase
        .from('payments')
        .insert({ order_id, amount, method, status: 'completed', transaction_ref: `TXN-${Date.now()}` })
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });

      // Update order status
      await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order_id);

      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/:id/refund', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('payments').update({ status: 'refunded' }).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
