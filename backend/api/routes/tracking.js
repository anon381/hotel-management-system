// Order Tracking Routes
module.exports = function(supabase, requireRole) {
  const router = require('express').Router();

  // GET /tracking/:orderId - get tracking steps for an order
  router.get('/:orderId', async (req, res) => {
    const { data, error } = await supabase
      .from('order_tracking_steps')
      .select('*')
      .eq('order_id', req.params.orderId)
      .order('step_order', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // PATCH /tracking/:orderId/advance - advance order to next status
  router.patch('/:orderId/advance', requireRole('admin', 'manager', 'kitchen_staff'), async (req, res) => {
    const { data: order, error: oErr } = await supabase
      .from('orders').select('status').eq('id', req.params.orderId).single();
    if (oErr) return res.status(400).json({ error: oErr.message });

    const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
    const idx = statusFlow.indexOf(order.status);
    if (idx === -1 || idx >= statusFlow.length - 1) return res.status(400).json({ error: 'Cannot advance further' });

    const nextStatus = statusFlow[idx + 1];
    const { error } = await supabase
      .from('orders').update({ status: nextStatus }).eq('id', req.params.orderId);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ status: nextStatus });
  });

  return router;
};

// noop: harmless touch