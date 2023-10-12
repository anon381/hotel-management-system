// Inventory Routes (v3) - with usage log, ingredient links, expiry alerts
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  // Get all inventory
  router.get('/', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { low_stock_only, category, search, expiring_soon } = req.query;
      let query = supabase.from('inventory').select('*').order('name');
      if (low_stock_only === 'true') query = query.eq('is_low_stock', true);
      if (category) query = query.eq('category', category);
      if (search) query = query.ilike('name', `%${search}%`);
      if (expiring_soon === 'true') {
        const soon = new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10);
        query = query.lte('expiry_date', soon).not('expiry_date', 'is', null);
      }
      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single item with restock history
  router.get('/:id', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { data: item } = await supabase.from('inventory').select('*').eq('id', req.params.id).single();
      const { data: restocks } = await supabase.from('inventory_restock_log')
        .select('*').eq('inventory_id', req.params.id).order('created_at', { ascending: false }).limit(20);
      const { data: usage } = await supabase.from('inventory_usage_log')
        .select('*, orders(order_number)').eq('inventory_id', req.params.id).order('created_at', { ascending: false }).limit(20);
      const { data: linkedItems } = await supabase.from('menu_item_ingredients')
        .select('*, menu_items(name, emoji)').eq('inventory_id', req.params.id);
      res.json({ ...item, restock_history: restocks, usage_history: usage, linked_menu_items: linkedItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create inventory item
  router.post('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('inventory').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'inventory_item_created', 'inventory', data.id, { name: data.name });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update inventory item
  router.patch('/:id', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('inventory')
        .update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete inventory item
  router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { error } = await supabase.from('inventory').delete().eq('id', req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'inventory_item_deleted', 'inventory', req.params.id);
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Restock with log
  router.post('/:id/restock', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { quantity, notes, supplier, invoice_number } = req.body;
      const { data: current } = await supabase.from('inventory')
        .select('quantity, cost_per_unit').eq('id', req.params.id).single();

      const newQty = parseFloat(current.quantity) + parseFloat(quantity);
      const { data, error } = await supabase.from('inventory')
        .update({ quantity: newQty, last_restocked: new Date().toISOString() })
        .eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });

      await supabase.from('inventory_restock_log').insert({
        inventory_id: req.params.id,
        quantity_added: quantity,
        cost_total: parseFloat(quantity) * parseFloat(current.cost_per_unit || 0),
        supplier: supplier || null,
        invoice_number: invoice_number || null,
        restocked_by: req.user.id,
        notes,
      });

      await logActivity(req.user.id, 'inventory_restocked', 'inventory', req.params.id, { quantity_added: quantity });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Restock history
  router.get('/:id/restock-history', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('inventory_restock_log')
        .select('*, profiles(full_name)')
        .eq('inventory_id', req.params.id)
        .order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Log manual usage (waste, adjustment)
  router.post('/:id/usage', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { quantity_used, reason = 'waste' } = req.body;
      const { data: current } = await supabase.from('inventory')
        .select('quantity').eq('id', req.params.id).single();

      const newQty = Math.max(0, parseFloat(current.quantity) - parseFloat(quantity_used));
      await supabase.from('inventory').update({ quantity: newQty }).eq('id', req.params.id);

      const { data, error } = await supabase.from('inventory_usage_log').insert({
        inventory_id: req.params.id, quantity_used, reason, logged_by: req.user.id,
      }).select().single();
      if (error) return res.status(400).json({ error: error.message });

      await logActivity(req.user.id, 'inventory_usage_logged', 'inventory', req.params.id, { quantity_used, reason });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Menu Item Ingredients ---

  // Get ingredients for a menu item
  router.get('/ingredients/:menuItemId', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('menu_item_ingredients')
        .select('*, inventory(name, quantity, unit, is_low_stock)')
        .eq('menu_item_id', req.params.menuItemId);
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Set ingredients for a menu item (replace all)
  router.put('/ingredients/:menuItemId', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { ingredients } = req.body; // array of { inventory_id, ingredient_name, quantity_needed, unit, is_optional }
      await supabase.from('menu_item_ingredients').delete().eq('menu_item_id', req.params.menuItemId);
      if (ingredients && ingredients.length > 0) {
        const rows = ingredients.map(i => ({ menu_item_id: req.params.menuItemId, ...i }));
        const { data, error } = await supabase.from('menu_item_ingredients').insert(rows).select();
        if (error) return res.status(400).json({ error: error.message });
        return res.json(data);
      }
      res.json([]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
// noop: harmless touch