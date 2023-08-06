// Gamification / Coins Routes
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  // ==================== CUSTOMER ENDPOINTS ====================

  // Get my coin summary
  router.get('/my', async (req, res) => {
    try {
      const { data: profile } = await supabase.from('profiles')
        .select('total_loyalty_points, membership_tier, lifetime_spent, total_orders')
        .eq('id', req.user.id).single();

      const { data: transactions } = await supabase.from('loyalty_transactions')
        .select('*').eq('customer_id', req.user.id).order('created_at', { ascending: false }).limit(50);

      // Get spin status
      const { data: lastSpin } = await supabase.from('spin_wheel_log')
        .select('*').eq('customer_id', req.user.id)
        .order('created_at', { ascending: false }).limit(1);

      // Determine daily spins allowed based on tier
      const spinsPerTier = { bronze: 1, silver: 2, gold: 3, platinum: 999 };
      const maxSpins = spinsPerTier[profile?.membership_tier || 'bronze'] || 1;

      // Count today's spins
      const today = new Date().toISOString().substring(0, 10);
      const { count: todaySpins } = await supabase.from('spin_wheel_log')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', req.user.id)
        .gte('created_at', today);

      // Earned this month
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthTx } = await supabase.from('loyalty_transactions')
        .select('points').eq('customer_id', req.user.id)
        .gt('points', 0).gte('created_at', monthStart);
      const earnedThisMonth = (monthTx || []).reduce((s, t) => s + t.points, 0);

      // Redeemed rewards count
      const { count: redeemedCount } = await supabase.from('coin_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', req.user.id);

      // Get available rewards
      const { data: rewards } = await supabase.from('coin_rewards')
        .select('*').eq('is_active', true).order('cost_coins');

      // Get milestones
      const { data: milestones } = await supabase.from('coin_milestones')
        .select('*').order('coins_required');

      res.json({
        coins: profile?.total_loyalty_points || 0,
        tier: profile?.membership_tier || 'bronze',
        lifetime_spent: profile?.lifetime_spent || 0,
        total_orders: profile?.total_orders || 0,
        earned_this_month: earnedThisMonth,
        redeemed_count: redeemedCount || 0,
        transactions: transactions || [],
        spin: {
          spins_today: todaySpins || 0,
          max_spins: maxSpins,
          can_spin: (todaySpins || 0) < maxSpins,
          last_spin: lastSpin?.[0] || null,
        },
        rewards: rewards || [],
        milestones: milestones || [],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Spin the wheel
  router.post('/spin', async (req, res) => {
    try {
      // Check daily limit
      const { data: profile } = await supabase.from('profiles')
        .select('total_loyalty_points, membership_tier').eq('id', req.user.id).single();

      const spinsPerTier = { bronze: 1, silver: 2, gold: 3, platinum: 999 };
      const maxSpins = spinsPerTier[profile?.membership_tier || 'bronze'] || 1;

      const today = new Date().toISOString().substring(0, 10);
      const { count: todaySpins } = await supabase.from('spin_wheel_log')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', req.user.id).gte('created_at', today);

      if ((todaySpins || 0) >= maxSpins) {
        return res.status(429).json({ error: 'Daily spin limit reached', max_spins: maxSpins });
      }

      // Get wheel segments
      const { data: segments } = await supabase.from('spin_wheel_segments')
        .select('*').eq('is_active', true).order('display_order');

      if (!segments || segments.length === 0) {
        return res.status(500).json({ error: 'Spin wheel not configured' });
      }

      // Weighted random
      const totalWeight = segments.reduce((s, seg) => s + seg.probability_weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedSegment = segments[0];
      for (const seg of segments) {
        rand -= seg.probability_weight;
        if (rand <= 0) { selectedSegment = seg; break; }
      }

      const coinsWon = selectedSegment.coins;
      const newBalance = (profile?.total_loyalty_points || 0) + coinsWon;

      // Log spin
      const { data: spinLog } = await supabase.from('spin_wheel_log').insert({
        customer_id: req.user.id,
        segment_id: selectedSegment.id,
        coins_won: coinsWon,
        segment_label: selectedSegment.label,
      }).select().single();

      // Add loyalty transaction
      await supabase.from('loyalty_transactions').insert({
        customer_id: req.user.id, points: coinsWon,
        reason: `Spin Wheel: ${selectedSegment.label}`,
        reference_type: 'spin', reference_id: spinLog.id, balance_after: newBalance,
      });

      // Update balance
      await supabase.from('profiles')
        .update({ total_loyalty_points: newBalance }).eq('id', req.user.id);

      // Notify
      await supabase.from('notifications').insert({
        user_id: req.user.id, type: 'loyalty',
        title: `🎰 You won ${coinsWon} coins!`,
        message: `Lucky spin! ${coinsWon} coins have been added to your balance.`,
        metadata: { coins: coinsWon, segment: selectedSegment.label },
      });

      res.json({
        coins_won: coinsWon,
        segment: selectedSegment,
        new_balance: newBalance,
        spins_remaining: maxSpins - (todaySpins || 0) - 1,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Redeem a reward
  router.post('/redeem', async (req, res) => {
    try {
      const { reward_id } = req.body;
      if (!reward_id) return res.status(400).json({ error: 'Reward ID required' });

      const { data: reward } = await supabase.from('coin_rewards')
        .select('*').eq('id', reward_id).eq('is_active', true).single();
      if (!reward) return res.status(404).json({ error: 'Reward not found' });

      const { data: profile } = await supabase.from('profiles')
        .select('total_loyalty_points').eq('id', req.user.id).single();

      if ((profile?.total_loyalty_points || 0) < reward.cost_coins) {
        return res.status(400).json({ error: 'Insufficient coins', needed: reward.cost_coins - (profile?.total_loyalty_points || 0) });
      }

      const newBalance = (profile?.total_loyalty_points || 0) - reward.cost_coins;

      // Create redemption record
      const { data: redemption } = await supabase.from('coin_redemptions').insert({
        customer_id: req.user.id, reward_id, coins_spent: reward.cost_coins,
        reward_name: reward.name, reward_type: reward.reward_type, reward_value: reward.reward_value,
      }).select().single();

      // Deduct coins
      await supabase.from('loyalty_transactions').insert({
        customer_id: req.user.id, points: -reward.cost_coins,
        reason: `Redeemed: ${reward.name}`,
        reference_type: 'redemption', reference_id: redemption.id, balance_after: newBalance,
      });

      await supabase.from('profiles').update({ total_loyalty_points: newBalance }).eq('id', req.user.id);

      // Notify
      await supabase.from('notifications').insert({
        user_id: req.user.id, type: 'loyalty',
        title: `${reward.icon} Reward Redeemed!`,
        message: `${reward.name} has been applied to your account.`,
        metadata: { reward_id: reward.id, coins_spent: reward.cost_coins },
      });

      await logActivity(req.user.id, 'reward_redeemed', 'coin_redemption', redemption.id, { reward: reward.name, coins: reward.cost_coins });

      res.json({ redemption, new_balance: newBalance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get my redemption history
  router.get('/redemptions', async (req, res) => {
    try {
      const { data, error } = await supabase.from('coin_redemptions')
        .select('*, coin_rewards(name, icon, reward_type)')
        .eq('customer_id', req.user.id).order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== ADMIN ENDPOINTS ====================

  // Get all customers coin data
  router.get('/admin/customers', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { search, tier, sort = 'coins' } = req.query;
      let query = supabase.from('profiles')
        .select('id, full_name, email, avatar_url, total_loyalty_points, membership_tier, lifetime_spent, total_orders, last_visit_at');

      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      if (tier) query = query.eq('membership_tier', tier);
      if (sort === 'coins') query = query.order('total_loyalty_points', { ascending: false });
      else if (sort === 'spent') query = query.order('lifetime_spent', { ascending: false });
      else query = query.order('full_name');

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get a customer's coin history
  router.get('/admin/customers/:id/history', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data: profile } = await supabase.from('profiles')
        .select('*').eq('id', req.params.id).single();
      const { data: transactions } = await supabase.from('loyalty_transactions')
        .select('*').eq('customer_id', req.params.id).order('created_at', { ascending: false }).limit(100);
      const { data: redemptions } = await supabase.from('coin_redemptions')
        .select('*, coin_rewards(name, icon)').eq('customer_id', req.params.id).order('created_at', { ascending: false });
      const { data: spins } = await supabase.from('spin_wheel_log')
        .select('*').eq('customer_id', req.params.id).order('created_at', { ascending: false }).limit(50);

      res.json({ profile, transactions, redemptions, spins });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: manually adjust coins
  router.post('/admin/adjust', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { customer_id, amount, reason } = req.body;
      if (!customer_id || !amount || !reason) return res.status(400).json({ error: 'All fields required' });

      const { data: profile } = await supabase.from('profiles')
        .select('total_loyalty_points').eq('id', customer_id).single();

      const newBalance = Math.max(0, (profile?.total_loyalty_points || 0) + parseInt(amount));

      await supabase.from('loyalty_transactions').insert({
        customer_id, points: parseInt(amount),
        reason: `Admin: ${reason}`, reference_type: 'manual', balance_after: newBalance,
      });

      await supabase.from('profiles').update({ total_loyalty_points: newBalance }).eq('id', customer_id);

      await logActivity(req.user.id, amount > 0 ? 'coins_added' : 'coins_deducted', 'profile', customer_id, { amount, reason });

      res.json({ new_balance: newBalance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: get gamification stats
  router.get('/admin/stats', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data: profiles } = await supabase.from('profiles')
        .select('total_loyalty_points, membership_tier');

      const totalCirculation = (profiles || []).reduce((s, p) => s + (p.total_loyalty_points || 0), 0);
      const tiers = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
      (profiles || []).forEach(p => { tiers[p.membership_tier] = (tiers[p.membership_tier] || 0) + 1; });

      // Total earned all time
      const { data: earned } = await supabase.from('loyalty_transactions')
        .select('points').gt('points', 0);
      const totalEarned = (earned || []).reduce((s, t) => s + t.points, 0);

      // Total spent
      const { data: spent } = await supabase.from('loyalty_transactions')
        .select('points').lt('points', 0);
      const totalSpent = Math.abs((spent || []).reduce((s, t) => s + t.points, 0));

      // Spin payouts
      const { data: spinData } = await supabase.from('spin_wheel_log').select('coins_won');
      const spinPayouts = (spinData || []).reduce((s, sp) => s + sp.coins_won, 0);

      // Redemption count
      const { count: redemptionCount } = await supabase.from('coin_redemptions')
        .select('*', { count: 'exact', head: true });

      res.json({
        total_in_circulation: totalCirculation,
        total_earned: totalEarned,
        total_spent: totalSpent,
        spin_payouts: spinPayouts,
        redemption_count: redemptionCount || 0,
        tier_distribution: tiers,
        total_customers: profiles?.length || 0,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: manage rewards
  router.get('/admin/rewards', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('coin_rewards').select('*').order('cost_coins');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/admin/rewards', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('coin_rewards').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/admin/rewards/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('coin_rewards')
        .update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin: manage spin wheel segments
  router.get('/admin/wheel', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('spin_wheel_segments')
        .select('*').order('display_order');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/admin/wheel', requireRole('admin'), async (req, res) => {
    try {
      const { segments } = req.body;
      await supabase.from('spin_wheel_segments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { data, error } = await supabase.from('spin_wheel_segments').insert(segments).select();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
// noop: harmless touch