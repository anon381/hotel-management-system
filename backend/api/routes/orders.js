// Order Routes (v2) - with item-level completion, ETA, loyalty
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  // Get orders
  router.get('/', async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;
      const { data: roles } = await supabase.from('user_roles').select('role')
        .eq('user_id', req.user.id).in('role', ['admin', 'manager', 'kitchen_staff', 'cashier']);

      let query = supabase.from('orders')
        .select('*, order_items(*, menu_items(name, emoji, image_url)), profiles(full_name), restaurant_tables(table_number, zone)')
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (!roles || roles.length === 0) query = query.eq('customer_id', req.user.id);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single order
  router.get('/:id', async (req, res) => {
    try {
      const { data, error } = await supabase.from('orders')
        .select('*, order_items(*, menu_items(name, emoji)), profiles(full_name), restaurant_tables(table_number, zone), payments(*)')
        .eq('id', req.params.id).single();
      if (error) return res.status(404).json({ error: 'Order not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create order
  router.post('/', async (req, res) => {
    try {
      const { items, table_id, notes, promo_code } = req.body;
      if (!items || items.length === 0) return res.status(400).json({ error: 'No items provided' });

      let discount = 0;
      let promoId = null;

      // Check promo code
      if (promo_code) {
        const { data: promo } = await supabase.from('promotions')
          .select('*').eq('code', promo_code).eq('is_active', true)
          .gte('expires_at', new Date().toISOString()).single();

        if (promo && (promo.max_uses === null || promo.current_uses < promo.max_uses)) {
          promoId = promo.id;
          if (promo.type === 'discount_percent') {
            discount = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0) * (promo.value / 100);
          } else if (promo.type === 'discount_fixed') {
            discount = promo.value;
          }
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase.from('orders')
        .insert({ customer_id: req.user.id, table_id, notes, discount, status: 'pending' })
        .select().single();
      if (orderError) return res.status(400).json({ error: orderError.message });

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        item_name: item.item_name || item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        special_instructions: item.special_instructions || null,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) return res.status(400).json({ error: itemsError.message });

      // Calculate totals
      await supabase.rpc('calculate_order_total', { _order_id: order.id });

      // Record promotion redemption
      if (promoId) {
        await supabase.from('promotion_redemptions').insert({
          promotion_id: promoId, customer_id: req.user.id, order_id: order.id, discount_applied: discount,
        });
        await supabase.from('promotions').update({ current_uses: supabase.rpc('increment', { x: 1 }) }).eq('id', promoId);
      }

      // Update table status
      if (table_id) {
        await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', table_id);
      }

      // Fetch complete order
      const { data: completeOrder } = await supabase.from('orders')
        .select('*, order_items(*, menu_items(name, emoji))').eq('id', order.id).single();

      // Notify kitchen staff
      const { data: kitchenUsers } = await supabase.from('user_roles').select('user_id').eq('role', 'kitchen_staff');
      if (kitchenUsers) {
        const notifications = kitchenUsers.map(u => ({
          user_id: u.user_id, type: 'kitchen', title: 'New Order',
          message: `Order #${order.order_number} — ${items.length} item(s)`,
          metadata: { order_id: order.id }, action_url: '/kitchen/orders',
        }));
        await supabase.from('notifications').insert(notifications);
      }

      await logActivity(req.user.id, 'order_created', 'order', order.id, { item_count: items.length });
      res.status(201).json(completeOrder);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update order status (kitchen/admin)
  router.patch('/:id/status', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { status, estimated_ready_minutes } = req.body;
      const updateData = { status };
      if (estimated_ready_minutes) updateData.estimated_ready_minutes = estimated_ready_minutes;
      if (status === 'ready') updateData.actual_ready_at = new Date().toISOString();
      if (status === 'served') updateData.served_at = new Date().toISOString();

      const { data, error } = await supabase.from('orders')
        .update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Award loyalty points on completion
      if (status === 'completed' && data.customer_id) {
        await supabase.rpc('award_loyalty_points', { _order_id: data.id });
      }

      // Release table on completion
      if ((status === 'completed' || status === 'cancelled') && data.table_id) {
        await supabase.from('restaurant_tables').update({ status: 'available' }).eq('id', data.table_id);
      }

      // Notify customer
      if (data.customer_id) {
        const statusMessages = {
          confirmed: 'Your order has been confirmed!',
          preparing: 'Your order is being prepared in the kitchen.',
          ready: 'Your order is ready for pickup/serving!',
          served: 'Enjoy your meal!',
          completed: 'Thank you for dining with us!',
          cancelled: 'Your order has been cancelled.',
        };
        await supabase.from('notifications').insert({
          user_id: data.customer_id, type: 'order', title: 'Order Update',
          message: statusMessages[status] || `Order #${data.order_number} is now ${status}`,
          metadata: { order_id: data.id, status }, action_url: '/customer/orders',
        });
      }

      await logActivity(req.user.id, 'order_status_updated', 'order', data.id, { status });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Toggle order item completion (kitchen item-level tracking)
  router.patch('/:orderId/items/:itemId/complete', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { is_completed } = req.body;
      const { data, error } = await supabase.from('order_items')
        .update({ is_completed, completed_at: is_completed ? new Date().toISOString() : null })
        .eq('id', req.params.itemId).eq('order_id', req.params.orderId).select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Check if all items completed → auto-mark order as ready
      const { data: pendingItems } = await supabase.from('order_items')
        .select('id').eq('order_id', req.params.orderId).eq('is_completed', false);

      if (pendingItems && pendingItems.length === 0) {
        await supabase.from('orders').update({ status: 'ready', actual_ready_at: new Date().toISOString() })
          .eq('id', req.params.orderId);
      }

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update ETA
  router.patch('/:id/eta', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    try {
      const { estimated_ready_minutes } = req.body;
      const { data, error } = await supabase.from('orders')
        .update({ estimated_ready_minutes }).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
