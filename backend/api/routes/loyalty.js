// Loyalty Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Get my loyalty summary
  router.get('/my', async (req, res) => {
    try {
      const { data: profile } = await supabase.from('profiles')
        .select('total_loyalty_points, membership_tier, lifetime_spent, total_orders')
        .eq('id', req.user.id).single();

      const { data: transactions } = await supabase.from('loyalty_transactions')
        .select('*').eq('customer_id', req.user.id).order('created_at', { ascending: false }).limit(20);

      res.json({ ...profile, transactions });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Redeem points
  router.post('/redeem', async (req, res) => {
    try {
      const { points, reason } = req.body;
      if (!points || points <= 0) return res.status(400).json({ error: 'Invalid points' });

      const { data: profile } = await supabase.from('profiles')
        .select('total_loyalty_points').eq('id', req.user.id).single();

      if (profile.total_loyalty_points < points) {
        return res.status(400).json({ error: 'Insufficient points' });
      }

      const newBalance = profile.total_loyalty_points - points;
      await supabase.from('loyalty_transactions').insert({
        customer_id: req.user.id, points: -points,
        reason: reason || 'Points redeemed', reference_type: 'manual', balance_after: newBalance,
      });
      await supabase.from('profiles').update({ total_loyalty_points: newBalance }).eq('id', req.user.id);

      res.json({ new_balance: newBalance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: view all loyalty data
  router.get('/all', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('profiles')
        .select('id, full_name, email, total_loyalty_points, membership_tier, lifetime_spent, total_orders')
        .order('total_loyalty_points', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: manually add points
  router.post('/award', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { customer_id, points, reason } = req.body;
      const { data: profile } = await supabase.from('profiles')
        .select('total_loyalty_points').eq('id', customer_id).single();

      const newBalance = (profile?.total_loyalty_points || 0) + points;
      await supabase.from('loyalty_transactions').insert({
        customer_id, points, reason: reason || 'Manual award',
        reference_type: 'manual', balance_after: newBalance,
      });
      await supabase.from('profiles').update({ total_loyalty_points: newBalance }).eq('id', customer_id);

      res.json({ new_balance: newBalance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
