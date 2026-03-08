// Reviews Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Get reviews for a menu item
  router.get('/item/:menuItemId', async (req, res) => {
    try {
      const { data, error } = await supabase.from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('menu_item_id', req.params.menuItemId).eq('is_visible', true)
        .order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get customer's reviews
  router.get('/my', async (req, res) => {
    try {
      const { data, error } = await supabase.from('reviews')
        .select('*, menu_items(name, emoji)')
        .eq('customer_id', req.user.id).order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create review
  router.post('/', async (req, res) => {
    try {
      const { menu_item_id, order_id, rating, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

      const { data, error } = await supabase.from('reviews')
        .insert({ customer_id: req.user.id, menu_item_id, order_id, rating, comment })
        .select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Bonus points for reviewing
      const { data: profile } = await supabase.from('profiles').select('total_loyalty_points').eq('id', req.user.id).single();
      const newBalance = (profile?.total_loyalty_points || 0) + 10;
      await supabase.from('loyalty_transactions').insert({
        customer_id: req.user.id, points: 10, reason: 'Review bonus',
        reference_type: 'review', reference_id: data.id, balance_after: newBalance,
      });
      await supabase.from('profiles').update({ total_loyalty_points: newBalance }).eq('id', req.user.id);

      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: get all reviews
  router.get('/all', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('reviews')
        .select('*, profiles(full_name), menu_items(name)')
        .order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: toggle review visibility
  router.patch('/:id/visibility', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { is_visible } = req.body;
      const { data, error } = await supabase.from('reviews')
        .update({ is_visible }).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
