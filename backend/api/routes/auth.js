// Auth Routes (v2)
const express = require('express');

module.exports = function (supabase) {
  const router = express.Router();

  // Sign up
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, full_name, phone, role = 'customer' } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

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

      res.json({ user: data.user, session: data.session, roles: roles?.map(r => r.role) || [], profile });
    } catch (err) {
      res.status(500).json({ error: err.message });
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

  // Get current user profile
  router.get('/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) return res.status(401).json({ error: error.message });

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);

      res.json({ user, profile, roles: roles?.map(r => r.role) || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update profile
  router.patch('/profile', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      const { full_name, phone, address, avatar_url } = req.body;

      const { data, error } = await supabase.from('profiles')
        .update({ full_name, phone, address, avatar_url })
        .eq('id', user.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
