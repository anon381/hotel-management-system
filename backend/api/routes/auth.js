// Auth Routes (v3) - with addresses, password change, avatar
const express = require('express');

module.exports = function (supabase) {
  const router = express.Router();

  // Sign up
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, full_name, phone, role = 'customer' } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

      const { data, error } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name, phone },
      });
      if (error) return res.status(400).json({ error: error.message });

      // Assign role (profile + loyalty created by trigger)
      if (role !== 'customer') {
        await supabase.from('user_roles').insert({ user_id: data.user.id, role });
      }

      res.status(201).json({ user: data.user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sign in
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: error.message });

      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

      // Update last visit
      await supabase.from('profiles').update({ last_visit_at: new Date().toISOString() }).eq('id', data.user.id);

      res.json({ user: data.user, session: data.session, roles: roles?.map(r => r.role) || [], profile });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sign out
  router.post('/logout', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) await supabase.auth.admin.signOut(token);
      res.json({ message: 'Logged out' });
    } catch (err) {
      res.json({ message: 'Logged out' });
    }
  });

  // Password reset request
  router.post('/reset-password', async (req, res) => {
    try {
      const { email } = req.body;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.origin || process.env.FRONTEND_URL}/reset-password`,
      });
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Password reset email sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update password (with valid session)
  router.post('/update-password', async (req, res) => {
    try {
      const { access_token, new_password } = req.body;
      if (new_password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
      const { error } = await supabase.auth.admin.updateUserById(
        (await supabase.auth.getUser(access_token)).data.user.id,
        { password: new_password }
      );
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Password updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Change password (authenticated)
  router.post('/change-password', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) return res.status(401).json({ error: 'Not authenticated' });

      const { new_password } = req.body;
      if (new_password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

      const { error } = await supabase.auth.admin.updateUserById(user.id, { password: new_password });
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Password changed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get current user profile
  router.get('/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) return res.status(401).json({ error: error.message });

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
      const { data: addresses } = await supabase.from('customer_addresses').select('*').eq('customer_id', user.id);

      res.json({ user, profile, roles: roles?.map(r => r.role) || [], addresses: addresses || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update profile
  router.patch('/profile', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      const { full_name, phone, address, avatar_url, date_of_birth, preferences } = req.body;

      const updateData = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
      if (preferences !== undefined) updateData.preferences = preferences;

      const { data, error } = await supabase.from('profiles')
        .update(updateData).eq('id', user.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Customer Addresses ---

  // Get my addresses
  router.get('/addresses', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      const { data, error } = await supabase.from('customer_addresses')
        .select('*').eq('customer_id', user.id).order('is_default', { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add address
  router.post('/addresses', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);

      // If setting as default, clear other defaults
      if (req.body.is_default) {
        await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', user.id);
      }

      const { data, error } = await supabase.from('customer_addresses')
        .insert({ ...req.body, customer_id: user.id }).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update address
  router.patch('/addresses/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);

      if (req.body.is_default) {
        await supabase.from('customer_addresses').update({ is_default: false }).eq('customer_id', user.id);
      }

      const { data, error } = await supabase.from('customer_addresses')
        .update(req.body).eq('id', req.params.id).eq('customer_id', user.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete address
  router.delete('/addresses/:id', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      const { error } = await supabase.from('customer_addresses')
        .delete().eq('id', req.params.id).eq('customer_id', user.id);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Address deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
// noop: harmless touch