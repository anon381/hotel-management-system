// Menu Routes (v2) - with tags support
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  // Get all menu items with tags
  router.get('/', async (req, res) => {
    try {
      const { category, available_only, featured, search } = req.query;
      let query = supabase.from('menu_items').select('*, menu_categories(name), menu_item_tags(tag)');

      if (category) query = query.eq('category', category);
      if (available_only === 'true') query = query.eq('is_available', true);
      if (featured === 'true') query = query.eq('is_featured', true);
      if (search) query = query.ilike('name', `%${search}%`);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single item with reviews
  router.get('/:id', async (req, res) => {
    try {
      const { data, error } = await supabase.from('menu_items')
        .select('*, menu_categories(name), menu_item_tags(tag), reviews(id, rating, comment, created_at, profiles(full_name))')
        .eq('id', req.params.id).single();
      if (error) return res.status(404).json({ error: 'Item not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create menu item with tags
  router.post('/', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { tags, ...itemData } = req.body;
      const { data, error } = await supabase.from('menu_items')
        .insert({ ...itemData, created_by: req.user.id }).select().single();
      if (error) return res.status(400).json({ error: error.message });

      if (tags && tags.length > 0) {
        await supabase.from('menu_item_tags').insert(
          tags.map(tag => ({ menu_item_id: data.id, tag }))
        );
      }

      await logActivity(req.user.id, 'menu_item_created', 'menu_item', data.id, { name: data.name });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update menu item
  router.put('/:id', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { tags, ...itemData } = req.body;
      const { data, error } = await supabase.from('menu_items')
        .update(itemData).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });

      if (tags !== undefined) {
        await supabase.from('menu_item_tags').delete().eq('menu_item_id', req.params.id);
        if (tags.length > 0) {
          await supabase.from('menu_item_tags').insert(
            tags.map(tag => ({ menu_item_id: req.params.id, tag }))
          );
        }
      }

      await logActivity(req.user.id, 'menu_item_updated', 'menu_item', data.id, { name: data.name });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Toggle availability (kitchen quick action)
  router.patch('/:id/availability', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { is_available } = req.body;
      const { data, error } = await supabase.from('menu_items')
        .update({ is_available }).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete menu item
  router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'menu_item_deleted', 'menu_item', req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get categories
  router.get('/categories/all', async (req, res) => {
    try {
      const { data, error } = await supabase.from('menu_categories').select('*').order('display_order');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create category
  router.post('/categories', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('menu_categories').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

// noop: harmless touch