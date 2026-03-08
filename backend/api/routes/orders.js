// Order Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Get orders (customers see own, admin/kitchen see all)
  router.get('/', async (req, res) => {
    try {
      const { status, limit = 50 } = req.query;
      let query = supabase
        .from('orders')
        .select('*, order_items(*, menu_items(name, image_url)), profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      // Check if admin or kitchen
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', req.user.id)
        .in('role', ['admin', 'kitchen_staff']);

      if (!roles || roles.length === 0) {
        query = query.eq('customer_id', req.user.id);
      }

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create order
  router.post('/', async (req, res) => {
    try {
      const { items, table_id, notes } = req.body;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: req.user.id,
          table_id,
          notes,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) return res.status(400).json({ error: orderError.message });

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        special_instructions: item.special_instructions || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) return res.status(400).json({ error: itemsError.message });

      // Calculate totals
      await supabase.rpc('calculate_order_total', { _order_id: order.id });

      // Fetch complete order
      const { data: completeOrder } = await supabase
        .from('orders')
        .select('*, order_items(*, menu_items(name))')
        .eq('id', order.id)
        .single();

      // Notify kitchen
      await supabase.from('notifications').insert({
        user_id: req.user.id, // Will be broadcast to kitchen via realtime
        type: 'kitchen',
        title: 'New Order',
        message: `Order #${order.order_number} placed with ${items.length} item(s)`,
        metadata: { order_id: order.id },
      });

      res.status(201).json(completeOrder);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update order status (kitchen/admin)
  router.patch('/:id/status', requireRole('admin', 'kitchen_staff'), async (req, res) => {
    try {
      const { status } = req.body;
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      // Notify customer
      if (data.customer_id) {
        await supabase.from('notifications').insert({
          user_id: data.customer_id,
          type: 'order',
          title: 'Order Update',
          message: `Your order #${data.order_number} is now ${status}`,
          metadata: { order_id: data.id, status },
        });
      }

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
