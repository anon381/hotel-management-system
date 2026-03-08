// Payment Routes (v2) - with tips and refunds
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { data: roles } = await supabase.from('user_roles').select('role')
        .eq('user_id', req.user.id).in('role', ['admin', 'manager', 'cashier']);

      let query = supabase.from('payments')
        .select('*, orders(order_number, customer_id, total, profiles(full_name))')
        .order('created_at', { ascending: false });

      if (!roles || roles.length === 0) {
        // Customer: only their order payments
        const { data: myOrders } = await supabase.from('orders')
          .select('id').eq('customer_id', req.user.id);
        const orderIds = myOrders?.map(o => o.id) || [];
        query = query.in('order_id', orderIds);
      }

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Process payment
  router.post('/', async (req, res) => {
    try {
      const { order_id, amount, method, tip_amount = 0 } = req.body;
      if (!order_id || !amount) return res.status(400).json({ error: 'Order ID and amount required' });

      const { data, error } = await supabase.from('payments').insert({
        order_id, amount: parseFloat(amount) + parseFloat(tip_amount),
        method: method || 'card', tip_amount,
        status: 'completed', transaction_ref: `TXN-${Date.now()}`,
      }).select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Update order status
      await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order_id);

      await logActivity(req.user.id, 'payment_completed', 'payment', data.id, { amount, method });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Refund
  router.patch('/:id/refund', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('payments')
        .update({ status: 'refunded' }).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Notify customer
      const { data: order } = await supabase.from('orders').select('customer_id').eq('id', data.order_id).single();
      if (order?.customer_id) {
        await supabase.from('notifications').insert({
          user_id: order.customer_id, type: 'order', title: 'Payment Refunded',
          message: `A refund of $${data.amount} has been processed.`,
          metadata: { payment_id: data.id },
        });
      }

      await logActivity(req.user.id, 'payment_refunded', 'payment', data.id, { amount: data.amount });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
