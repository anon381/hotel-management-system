// Promotions Routes
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  // Get active promotions (customers)
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase.from('promotions')
        .select('*').eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
        .order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Validate promo code
  router.post('/validate', async (req, res) => {
    try {
      const { code, order_amount } = req.body;
      const { data: promo, error } = await supabase.from('promotions')
        .select('*').eq('code', code).eq('is_active', true).single();

      if (error || !promo) return res.status(404).json({ error: 'Invalid promo code' });
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) return res.status(400).json({ error: 'Promo expired' });
      if (promo.max_uses && promo.current_uses >= promo.max_uses) return res.status(400).json({ error: 'Promo fully redeemed' });
      if (order_amount && promo.min_order_amount > order_amount) return res.status(400).json({ error: `Minimum order $${promo.min_order_amount}` });

      // Check if customer already used it
      const { data: existing } = await supabase.from('promotion_redemptions')
        .select('id').eq('promotion_id', promo.id).eq('customer_id', req.user.id);
      if (existing && existing.length > 0) return res.status(400).json({ error: 'Already used this promo' });

      let discount = 0;
      if (promo.type === 'discount_percent') discount = (order_amount || 0) * (promo.value / 100);
      else if (promo.type === 'discount_fixed') discount = promo.value;
      else if (promo.type === 'bonus_points') discount = 0; // points awarded separately

      res.json({ valid: true, promotion: promo, discount_amount: Math.round(discount * 100) / 100 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: create promotion
  router.post('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('promotions')
        .insert({ ...req.body, created_by: req.user.id }).select().single();
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'promotion_created', 'promotion', data.id, { title: data.title });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: get all promotions including inactive
  router.get('/all', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('promotions')
        .select('*, promotion_redemptions(count)').order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: update promotion
  router.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('promotions')
        .update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
