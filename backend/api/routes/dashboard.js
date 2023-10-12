// Dashboard Stats Route (v3) - comprehensive analytics
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Get dashboard overview stats
  router.get('/stats', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Top selling items
  router.get('/top-sellers', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { limit = 10, days = 30 } = req.query;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const { data, error } = await supabase.from('order_items')
        .select('quantity, item_name, unit_price, menu_items(name, emoji, price, image_url)')
        .gte('created_at', since);
      if (error) return res.status(400).json({ error: error.message });

      const itemMap = {};
      data.forEach(oi => {
        const name = oi.item_name || oi.menu_items?.name || 'Unknown';
        if (!itemMap[name]) itemMap[name] = { name, emoji: oi.menu_items?.emoji, image_url: oi.menu_items?.image_url, total_qty: 0, revenue: 0 };
        itemMap[name].total_qty += oi.quantity;
        itemMap[name].revenue += oi.quantity * parseFloat(oi.unit_price || oi.menu_items?.price || 0);
      });

      const sorted = Object.values(itemMap).sort((a, b) => b.total_qty - a.total_qty).slice(0, parseInt(limit));
      res.json(sorted);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Revenue by period
  router.get('/revenue', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { from, to, group_by = 'day' } = req.query;
      let query = supabase.from('payments')
        .select('amount, method, created_at, tip_amount').eq('status', 'completed');
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data, error } = await query.order('created_at');
      if (error) return res.status(400).json({ error: error.message });

      const total = data.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const totalTips = data.reduce((sum, p) => sum + parseFloat(p.tip_amount || 0), 0);
      const byMethod = {};
      const byDate = {};

      data.forEach(p => {
        byMethod[p.method] = (byMethod[p.method] || 0) + parseFloat(p.amount);
        const dateKey = group_by === 'month'
          ? p.created_at.substring(0, 7)
          : p.created_at.substring(0, 10);
        byDate[dateKey] = (byDate[dateKey] || 0) + parseFloat(p.amount);
      });

      res.json({ total_revenue: total, total_tips: totalTips, transaction_count: data.length, by_method: byMethod, by_date: byDate });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Kitchen performance
  router.get('/kitchen-stats', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const today = new Date().toISOString().substring(0, 10);
      const { data: orders } = await supabase.from('orders')
        .select('status, created_at, actual_ready_at, estimated_ready_minutes')
        .gte('created_at', today);

      const preparing = orders?.filter(o => o.status === 'preparing').length || 0;
      const ready = orders?.filter(o => o.status === 'ready').length || 0;
      const pending = orders?.filter(o => o.status === 'pending').length || 0;
      const completed = orders?.filter(o => ['completed', 'served'].includes(o.status)) || [];

      let avgServiceTime = 0;
      if (completed.length > 0) {
        const times = completed
          .filter(o => o.actual_ready_at)
          .map(o => (new Date(o.actual_ready_at) - new Date(o.created_at)) / 60000);
        avgServiceTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      }

      res.json({ preparing, ready, pending, completed_today: completed.length, avg_service_minutes: avgServiceTime });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Customer stats summary
  router.get('/customer-stats', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data: profiles } = await supabase.from('profiles')
        .select('membership_tier, lifetime_spent, total_orders');

      const tiers = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
      let totalSpent = 0;
      let totalOrders = 0;
      (profiles || []).forEach(p => {
        tiers[p.membership_tier] = (tiers[p.membership_tier] || 0) + 1;
        totalSpent += parseFloat(p.lifetime_spent || 0);
        totalOrders += p.total_orders || 0;
      });

      res.json({
        total_customers: profiles?.length || 0,
        tier_breakdown: tiers,
        total_revenue: totalSpent,
        total_orders: totalOrders,
        avg_order_value: totalOrders > 0 ? Math.round(totalSpent / totalOrders * 100) / 100 : 0,
        avg_lifetime_value: profiles?.length > 0 ? Math.round(totalSpent / profiles.length * 100) / 100 : 0,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings
  router.get('/settings', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('app_settings').select('*').order('key');
      if (error) return res.status(400).json({ error: error.message });
      // Convert to key-value object
      const settings = {};
      data.forEach(s => { settings[s.key] = s.value; });
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update settings
  router.patch('/settings', requireRole('admin'), async (req, res) => {
    try {
      const updates = req.body; // { key: value, key2: value2 }
      for (const [key, value] of Object.entries(updates)) {
        await supabase.from('app_settings')
          .upsert({ key, value: JSON.stringify(value), updated_by: req.user.id }, { onConflict: 'key' });
      }
      res.json({ message: 'Settings updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
// noop: harmless touch