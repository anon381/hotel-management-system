// Referral System Routes
module.exports = function(supabase, requireRole, logActivity) {
  const router = require('express').Router();

  // GET /referrals/my-code - get current user's referral code
  router.get('/my-code', async (req, res) => {
    const { data, error } = await supabase
      .from('referral_codes').select('*').eq('referrer_id', req.user.id).single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // GET /referrals/my-referrals - list of people I referred
  router.get('/my-referrals', async (req, res) => {
    const { data, error } = await supabase
      .from('referral_log').select('*, referee:profiles!referee_id(full_name, avatar_url)')
      .eq('referrer_id', req.user.id).order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // POST /referrals/redeem - redeem a referral code (used by new user)
  router.post('/redeem', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });

    // Check if user already referred
    const { data: existing } = await supabase
      .from('referral_log').select('id').eq('referee_id', req.user.id).single();
    if (existing) return res.status(400).json({ error: 'You have already used a referral code' });

    // Find code
    const { data: refCode, error: cErr } = await supabase
      .from('referral_codes').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();
    if (cErr || !refCode) return res.status(404).json({ error: 'Invalid or expired referral code' });
    if (refCode.referrer_id === req.user.id) return res.status(400).json({ error: 'Cannot use your own code' });
    if (refCode.current_uses >= refCode.max_uses) return res.status(400).json({ error: 'Code has reached max uses' });

    // Award coins to both
    const referrerBonus = refCode.bonus_coins_referrer;
    const refereeBonus = refCode.bonus_coins_referee;

    // Update referrer points
    const { data: referrerProfile } = await supabase
      .from('profiles').select('total_loyalty_points').eq('id', refCode.referrer_id).single();
    const newReferrerBal = (referrerProfile?.total_loyalty_points || 0) + referrerBonus;
    await supabase.from('profiles').update({ total_loyalty_points: newReferrerBal }).eq('id', refCode.referrer_id);
    await supabase.from('loyalty_transactions').insert({
      customer_id: refCode.referrer_id, points: referrerBonus, reason: 'Referral bonus',
      reference_type: 'referral', balance_after: newReferrerBal
    });

    // Update referee points
    const { data: myProfile } = await supabase
      .from('profiles').select('total_loyalty_points').eq('id', req.user.id).single();
    const newMyBal = (myProfile?.total_loyalty_points || 0) + refereeBonus;
    await supabase.from('profiles').update({ total_loyalty_points: newMyBal }).eq('id', req.user.id);
    await supabase.from('loyalty_transactions').insert({
      customer_id: req.user.id, points: refereeBonus, reason: 'Referred by friend',
      reference_type: 'referral', balance_after: newMyBal
    });

    // Log referral
    await supabase.from('referral_log').insert({
      referrer_id: refCode.referrer_id, referee_id: req.user.id,
      referral_code_id: refCode.id, coins_awarded_referrer: referrerBonus, coins_awarded_referee: refereeBonus
    });

    // Increment uses
    await supabase.from('referral_codes').update({ current_uses: refCode.current_uses + 1 }).eq('id', refCode.id);

    // Notify referrer
    await supabase.from('notifications').insert({
      user_id: refCode.referrer_id, type: 'loyalty',
      title: 'Referral Bonus! 🎉', message: `Someone used your referral code! You earned ${referrerBonus} coins.`
    });

    await logActivity(req.user.id, 'referral_redeemed', 'referral_code', refCode.id, { code });
    res.json({ coins_earned: refereeBonus, message: `Welcome! You earned ${refereeBonus} coins.` });
  });

  // GET /referrals/admin/stats - admin view of all referrals
  router.get('/admin/stats', requireRole('admin', 'manager'), async (req, res) => {
    const { data: logs } = await supabase
      .from('referral_log').select('*, referrer:profiles!referrer_id(full_name), referee:profiles!referee_id(full_name)')
      .order('created_at', { ascending: false }).limit(100);
    const { count: totalReferrals } = await supabase.from('referral_log').select('*', { count: 'exact', head: true });
    const { data: topReferrers } = await supabase
      .from('referral_log').select('referrer_id, referrer:profiles!referrer_id(full_name)')
      .then(r => {
        const counts = {};
        (r.data || []).forEach(l => {
          counts[l.referrer_id] = counts[l.referrer_id] || { name: l.referrer?.full_name, count: 0 };
          counts[l.referrer_id].count++;
        });
        return { data: Object.entries(counts).sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([id, v]) => ({ id, ...v })) };
      });
    res.json({ total_referrals: totalReferrals, logs, top_referrers: topReferrers });
  });

  return router;
};
