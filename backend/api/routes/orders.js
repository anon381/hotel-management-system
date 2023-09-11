// Order Routes (v3) - with delivery, cancel reason, inventory deduction
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  // Get orders (filtered by role)
  router.get('/', async (req, res) => {
    try {
      const { status, order_type, limit = 50, offset = 0, from, to } = req.query;
      const { data: roles } = await supabase.from('user_roles').select('role')
        .eq('user_id', req.user.id).in('role', ['admin', 'manager', 'kitchen_staff', 'cashier']);

      let query = supabase.from('orders')
        .select('*, order_items(*, menu_items(name, emoji, image_url)), profiles(full_name, phone), restaurant_tables(table_number, zone)')
        .order('created_at', { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

      if (!roles || roles.length === 0) query = query.eq('customer_id', req.user.id);
      if (status) query = query.eq('status', status);
      if (order_type) query = query.eq('order_type', order_type);
      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single order with full details
  router.get('/:id', async (req, res) => {
    try {
      const { data, error } = await supabase.from('orders')
        .select('*, order_items(*, menu_items(name, emoji, image_url)), profiles(full_name, phone, email), restaurant_tables(table_number, zone), payments(*)')
        .eq('id', req.params.id).single();
      if (error) return res.status(404).json({ error: 'Order not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create order (supports dine_in, takeaway, delivery)
  router.post('/', async (req, res) => {
    try {
      const { items, table_id, notes, promo_code, order_type = 'dine_in', delivery_address, delivery_instructions } = req.body;
      if (!items || items.length === 0) return res.status(400).json({ error: 'No items provided' });

      let discount = 0;
      let promoId = null;
      let delivery_fee = 0;

      // Delivery fee from settings
      if (order_type === 'delivery') {
        const { data: setting } = await supabase.from('app_settings').select('value').eq('key', 'delivery_fee').single();
        delivery_fee = setting ? parseFloat(setting.value) : 5;
      }

      // Check promo code
      if (promo_code) {
        const { data: promo } = await supabase.from('promotions')
          .select('*').eq('code', promo_code).eq('is_active', true)
          .gte('expires_at', new Date().toISOString()).single();

        if (promo && (promo.max_uses === null || promo.current_uses < promo.max_uses)) {
          // Check per-customer limit
          const { data: prevUses } = await supabase.from('promotion_redemptions')
            .select('id').eq('promotion_id', promo.id).eq('customer_id', req.user.id);
          if (!prevUses || prevUses.length < (promo.max_uses_per_customer || 1)) {
            promoId = promo.id;
            const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
            if (promo.type === 'discount_percent') discount = subtotal * (promo.value / 100);
            else if (promo.type === 'discount_fixed') discount = promo.value;
          }
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase.from('orders')
        .insert({
          customer_id: req.user.id, table_id: order_type === 'dine_in' ? table_id : null,
          order_type, notes, discount, delivery_fee, delivery_address, delivery_instructions,
          status: 'pending',
        }).select().single();
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
        await supabase.rpc('increment_promo_uses', { _promo_id: promoId });
      }

      // Update table status for dine-in
      if (order_type === 'dine_in' && table_id) {
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
          message: `Order #${order.order_number} — ${items.length} item(s) [${order_type.replace('_', ' ')}]`,
          metadata: { order_id: order.id, order_type }, action_url: '/kitchen/orders',
        }));
        await supabase.from('notifications').insert(notifications);
      }

      await logActivity(req.user.id, 'order_created', 'order', order.id, { item_count: items.length, order_type });
      res.status(201).json(completeOrder);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update order status (kitchen/admin)
  router.patch('/:id/status', requireRole('admin', 'manager', 'kitchen_staff', 'cashier'), async (req, res) => {
    try {
      const { status, estimated_ready_minutes, cancel_reason } = req.body;
      const updateData = { status };
      if (estimated_ready_minutes) updateData.estimated_ready_minutes = estimated_ready_minutes;
      if (status === 'ready') updateData.actual_ready_at = new Date().toISOString();
      if (status === 'served') updateData.served_at = new Date().toISOString();
      if (status === 'completed') updateData.completed_at = new Date().toISOString();
      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancel_reason = cancel_reason || null;
      }

      const { data, error } = await supabase.from('orders')
        .update(updateData).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Award loyalty points on completion
      if (status === 'completed' && data.customer_id) {
        await supabase.rpc('award_loyalty_points', { _order_id: data.id });
        // Deduct inventory
        await supabase.rpc('deduct_inventory_for_order', { _order_id: data.id });
      }

      // Release table on completion/cancel
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
          completed: 'Thank you for dining with us! You\'ve earned loyalty points.',
          cancelled: cancel_reason ? `Your order was cancelled: ${cancel_reason}` : 'Your order has been cancelled.',
        };
        await supabase.from('notifications').insert({
          user_id: data.customer_id, type: 'order', title: 'Order Update',
          message: statusMessages[status] || `Order #${data.order_number} is now ${status}`,
          metadata: { order_id: data.id, status }, action_url: '/customer/orders',
        });
      }

      await logActivity(req.user.id, 'order_status_updated', 'order', data.id, { status, cancel_reason });
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
        .update({
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
          completed_by: is_completed ? req.user.id : null,
        })
        .eq('id', req.params.itemId).eq('order_id', req.params.orderId).select().single();
      if (error) return res.status(400).json({ error: error.message });

      // Check if all items completed → auto-mark order as ready
      const { data: pendingItems } = await supabase.from('order_items')
        .select('id').eq('order_id', req.params.orderId).eq('is_completed', false);

      if (pendingItems && pendingItems.length === 0) {
        await supabase.from('orders').update({ status: 'ready', actual_ready_at: new Date().toISOString() })
          .eq('id', req.params.orderId);

        // Notify customer that order is ready
        const { data: order } = await supabase.from('orders').select('customer_id, order_number').eq('id', req.params.orderId).single();
        if (order?.customer_id) {
          await supabase.from('notifications').insert({
            user_id: order.customer_id, type: 'order', title: 'Order Ready! 🎉',
            message: `Order #${order.order_number} is ready.`, action_url: '/customer/orders',
          });
        }
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

  // Reorder (duplicate a previous order)
  router.post('/:id/reorder', async (req, res) => {
    try {
      const { data: original } = await supabase.from('orders')
        .select('*, order_items(menu_item_id, item_name, quantity, unit_price, special_instructions)')
        .eq('id', req.params.id).eq('customer_id', req.user.id).single();

      if (!original) return res.status(404).json({ error: 'Order not found' });

      const { data: newOrder, error } = await supabase.from('orders')
        .insert({ customer_id: req.user.id, order_type: original.order_type, status: 'pending', notes: 'Reorder of #' + original.order_number })
        .select().single();
      if (error) return res.status(400).json({ error: error.message });

      const items = original.order_items.map(i => ({
        order_id: newOrder.id, menu_item_id: i.menu_item_id, item_name: i.item_name,
        quantity: i.quantity, unit_price: i.unit_price, special_instructions: i.special_instructions,
      }));
      await supabase.from('order_items').insert(items);
      await supabase.rpc('calculate_order_total', { _order_id: newOrder.id });

      const { data: complete } = await supabase.from('orders')
        .select('*, order_items(*, menu_items(name, emoji))').eq('id', newOrder.id).single();
      res.status(201).json(complete);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
// noop: harmless touch