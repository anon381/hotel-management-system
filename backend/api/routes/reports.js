// Report Routes (v2) - comprehensive analytics
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Revenue summary
  router.get('/revenue', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { from, to } = req.query;
      let query = supabase.from('payments').select('amount, created_at, method, status, tip_amount').eq('status', 'completed');
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });

      const total = data.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalTips = data.reduce((sum, p) => sum + parseFloat(p.tip_amount || 0), 0);
      const byMethod = data.reduce((acc, p) => { acc[p.method] = (acc[p.method] || 0) + parseFloat(p.amount); return acc; }, {});

      res.json({ total_revenue: total, total_tips: totalTips, transaction_count: data.length, by_method: byMethod });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Order stats
  router.get('/orders', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { from, to } = req.query;
      let query = supabase.from('orders').select('status, total, created_at');
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });

      const byStatus = data.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
      const avgTotal = data.length > 0 ? data.reduce((s, o) => s + parseFloat(o.total || 0), 0) / data.length : 0;

      res.json({ total_orders: data.length, by_status: byStatus, avg_order_value: Math.round(avgTotal * 100) / 100 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Top items
  router.get('/top-items', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('order_items').select('quantity, item_name, unit_price, menu_items(name, price, emoji)');
      if (error) return res.status(400).json({ error: error.message });

      const itemMap = {};
      data.forEach(oi => {
        const name = oi.item_name || oi.menu_items?.name || 'Unknown';
        if (!itemMap[name]) itemMap[name] = { name, emoji: oi.menu_items?.emoji, total_qty: 0, revenue: 0 };
        itemMap[name].total_qty += oi.quantity;
        itemMap[name].revenue += oi.quantity * parseFloat(oi.unit_price || oi.menu_items?.price || 0);
      });

      res.json(Object.values(itemMap).sort((a, b) => b.total_qty - a.total_qty).slice(0, 10));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Category breakdown
  router.get('/categories', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('order_items').select('quantity, unit_price, menu_items(category)');
      if (error) return res.status(400).json({ error: error.message });

      const catMap = {};
      data.forEach(oi => {
        const cat = oi.menu_items?.category || 'other';
        if (!catMap[cat]) catMap[cat] = { category: cat, orders: 0, revenue: 0 };
        catMap[cat].orders += oi.quantity;
        catMap[cat].revenue += oi.quantity * parseFloat(oi.unit_price || 0);
      });

      res.json(Object.values(catMap).sort((a, b) => b.revenue - a.revenue));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Customer insights
  router.get('/customers', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('profiles')
        .select('id, full_name, email, total_loyalty_points, membership_tier, lifetime_spent, total_orders, total_visits, member_since')
        .order('lifetime_spent', { ascending: false }).limit(50);
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Hourly order distribution
  router.get('/hourly', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('orders').select('created_at').neq('status', 'cancelled');
      if (error) return res.status(400).json({ error: error.message });

      const hourly = Array(24).fill(0);
      data.forEach(o => {
        const hour = new Date(o.created_at).getHours();
        hourly[hour]++;
      });

      res.json(hourly.map((count, hour) => ({ hour: `${hour}:00`, orders: count })));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

// noop: harmless touch