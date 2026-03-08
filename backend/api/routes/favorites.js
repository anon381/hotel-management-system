// Favorites Routes (v2)
const express = require('express');

module.exports = function (supabase) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase.from('favorites')
        .select('*, menu_items(*, menu_item_tags(tag))').eq('customer_id', req.user.id);
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { menu_item_id } = req.body;
      const { data, error } = await supabase.from('favorites')
        .insert({ customer_id: req.user.id, menu_item_id })
        .select('*, menu_items(*)').single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete('/:menu_item_id', async (req, res) => {
    try {
      const { error } = await supabase.from('favorites')
        .delete().eq('customer_id', req.user.id).eq('menu_item_id', req.params.menu_item_id);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Removed from favorites' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Check if item is favorited
  router.get('/check/:menu_item_id', async (req, res) => {
    try {
      const { data } = await supabase.from('favorites')
        .select('id').eq('customer_id', req.user.id).eq('menu_item_id', req.params.menu_item_id);
      res.json({ is_favorite: data && data.length > 0 });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
