// Report Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Revenue summary
  router.get('/revenue', requireRole('admin'), async (req, res) => {
    try {
      const { from, to } = req.query;
      let query = supabase
        .from('payments')
        .select('amount, created_at, method, status')
        .eq('status', 'completed');

      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });

      const total = data.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const byMethod = data.reduce((acc, p) => {
        acc[p.method] = (acc[p.method] || 0) + parseFloat(p.amount);
        return acc;
      }, {});

      res.json({ total_revenue: total, transaction_count: data.length, by_method: byMethod });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Order stats
  router.get('/orders', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('orders').select('status, total, created_at');
      if (error) return res.status(400).json({ error: error.message });

      const byStatus = data.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      res.json({ total_orders: data.length, by_status: byStatus });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Top items
  router.get('/top-items', requireRole('admin'), async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, menu_items(name, price)');
      if (error) return res.status(400).json({ error: error.message });

      const itemMap = {};
      data.forEach(oi => {
        const name = oi.menu_items?.name || 'Unknown';
        if (!itemMap[name]) itemMap[name] = { name, total_qty: 0, revenue: 0 };
        itemMap[name].total_qty += oi.quantity;
        itemMap[name].revenue += oi.quantity * parseFloat(oi.menu_items?.price || 0);
      });

      const sorted = Object.values(itemMap).sort((a, b) => b.total_qty - a.total_qty).slice(0, 10);
      res.json(sorted);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
