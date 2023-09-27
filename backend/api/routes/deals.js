// Daily Deals & Happy Hour Routes
module.exports = function(supabase, requireRole, logActivity) {
  const router = require('express').Router();

  // GET /deals/active - get currently active deals
  router.get('/active', async (req, res) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);

    const { data, error } = await supabase
      .from('daily_deals').select('*, menu_item:menu_items(name, emoji, price)')
      .eq('is_active', true)
      .or(`day_of_week.eq.${dayOfWeek},day_of_week.is.null`)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // GET /deals/all - admin get all deals
  router.get('/all', requireRole('admin', 'manager'), async (req, res) => {
    const { data, error } = await supabase
      .from('daily_deals').select('*').order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // POST /deals - create new deal
  router.post('/', requireRole('admin', 'manager'), async (req, res) => {
    const { title, description, deal_type, deal_value, menu_item_id, category_filter, day_of_week, start_time, end_time, is_happy_hour, min_order_amount, max_discount, banner_emoji, expires_at } = req.body;
    const { data, error } = await supabase.from('daily_deals').insert({
      title, description, deal_type, deal_value, menu_item_id, category_filter,
      day_of_week, start_time, end_time, is_happy_hour, min_order_amount,
      max_discount, banner_emoji, expires_at, created_by: req.user.id
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    await logActivity(req.user.id, 'deal_created', 'daily_deal', data.id, { title });
    res.status(201).json(data);
  });

  // PATCH /deals/:id - update deal
  router.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
    const { data, error } = await supabase.from('daily_deals').update(req.body).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // DELETE /deals/:id
  router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
    const { error } = await supabase.from('daily_deals').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // GET /deals/happy-hour - get today's happy hour deals
  router.get('/happy-hour', async (req, res) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const { data, error } = await supabase
      .from('daily_deals').select('*')
      .eq('is_active', true).eq('is_happy_hour', true)
      .or(`day_of_week.eq.${dayOfWeek},day_of_week.is.null`);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  return router;
};

// noop: harmless touch