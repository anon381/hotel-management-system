// Menu Routes
const express = require('express');

module.exports = function (supabase) {
  const router = express.Router();

  // Get all menu items
  router.get('/', async (req, res) => {
    try {
      const { category, available_only } = req.query;
      let query = supabase.from('menu_items').select('*, menu_categories(name)');

      if (category) query = query.eq('category', category);
      if (available_only === 'true') query = query.eq('is_available', true);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single menu item
  router.get('/:id', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, menu_categories(name)')
        .eq('id', req.params.id)
        .single();
      if (error) return res.status(404).json({ error: 'Item not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create menu item (admin/kitchen)
  router.post('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({ ...req.body, created_by: req.user.id })
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update menu item
  router.put('/:id', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete menu item
  router.delete('/:id', async (req, res) => {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get categories
  router.get('/categories/all', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('display_order');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
