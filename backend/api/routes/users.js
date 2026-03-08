// Users & Roles Management Routes (Admin)
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  // Get all users with roles and profiles
  router.get('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data: profiles, error } = await supabase.from('profiles')
        .select('*, user_roles(role)').order('created_at', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(profiles);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single user details
  router.get('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data: profile } = await supabase.from('profiles')
        .select('*, user_roles(role)').eq('id', req.params.id).single();
      const { data: orders } = await supabase.from('orders')
        .select('id, order_number, total, status, created_at')
        .eq('customer_id', req.params.id).order('created_at', { ascending: false }).limit(10);
      const { data: loyalty } = await supabase.from('loyalty_transactions')
        .select('*').eq('customer_id', req.params.id).order('created_at', { ascending: false }).limit(10);

      res.json({ ...profile, recent_orders: orders, loyalty_history: loyalty });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Assign role to user
  router.post('/:id/roles', requireRole('admin'), async (req, res) => {
    try {
      const { role } = req.body;
      const { data, error } = await supabase.from('user_roles')
        .insert({ user_id: req.params.id, role }).select().single();
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'role_assigned', 'user', req.params.id, { role });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Remove role from user
  router.delete('/:id/roles/:role', requireRole('admin'), async (req, res) => {
    try {
      const { error } = await supabase.from('user_roles')
        .delete().eq('user_id', req.params.id).eq('role', req.params.role);
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'role_removed', 'user', req.params.id, { role: req.params.role });
      res.json({ message: 'Role removed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Deactivate user (admin only)
  router.patch('/:id/deactivate', requireRole('admin'), async (req, res) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(req.params.id, { ban_duration: '876000h' });
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'user_deactivated', 'user', req.params.id);
      res.json({ message: 'User deactivated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reactivate user
  router.patch('/:id/activate', requireRole('admin'), async (req, res) => {
    try {
      const { error } = await supabase.auth.admin.updateUserById(req.params.id, { ban_duration: 'none' });
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'user_activated', 'user', req.params.id);
      res.json({ message: 'User activated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete user (admin only, cascades)
  router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      await logActivity(req.user.id, 'user_deleted', 'user', req.params.id);
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get activity log
  router.get('/activity/log', requireRole('admin'), async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const { data, error } = await supabase.from('activity_log')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false }).limit(parseInt(limit));
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
