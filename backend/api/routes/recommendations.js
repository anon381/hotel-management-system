// AI Dish Recommendations Routes
module.exports = function(supabase, requireRole) {
  const router = require('express').Router();

  // GET /recommendations - get personalized recommendations for current user
  router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const { data, error } = await supabase.rpc('get_recommendations', {
      _customer_id: req.user.id, _limit: limit
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // GET /recommendations/trending - popular items across all customers
  router.get('/trending', async (req, res) => {
    const { data, error } = await supabase
      .from('menu_items').select('*')
      .eq('is_available', true)
      .order('total_orders', { ascending: false })
      .limit(8);
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // GET /recommendations/preferences - get customer's learned preferences
  router.get('/preferences', async (req, res) => {
    const { data, error } = await supabase
      .from('customer_preferences').select('*').eq('customer_id', req.user.id).single();
    if (error && error.code !== 'PGRST116') return res.status(400).json({ error: error.message });
    res.json(data || { favorite_categories: [], dietary_restrictions: [], spice_preference: 'mild' });
  });

  // PATCH /recommendations/preferences - update dietary preferences
  router.patch('/preferences', async (req, res) => {
    const { dietary_restrictions, spice_preference, favorite_tags } = req.body;
    const { data, error } = await supabase
      .from('customer_preferences')
      .upsert({
        customer_id: req.user.id,
        dietary_restrictions: dietary_restrictions || [],
        spice_preference: spice_preference || 'mild',
        favorite_tags: favorite_tags || []
      }, { onConflict: 'customer_id' })
      .select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // POST /recommendations/:itemId/clicked - track recommendation click
  router.post('/:itemId/clicked', async (req, res) => {
    await supabase.from('recommendation_log').insert({
      customer_id: req.user.id, menu_item_id: req.params.itemId,
      score: 0, reason: req.body.reason || 'clicked', was_clicked: true
    });
    res.json({ success: true });
  });

  return router;
};
