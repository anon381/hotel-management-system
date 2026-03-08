// Auth Routes
const express = require('express');

module.exports = function (supabase) {
  const router = express.Router();

  // Sign up
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, full_name, role = 'customer' } = req.body;

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (error) return res.status(400).json({ error: error.message });

      // Assign role
      await supabase.from('user_roles').insert({ user_id: data.user.id, role });

      res.status(201).json({ user: data.user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Sign in
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: error.message });

      // Get roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);

      res.json({
        user: data.user,
        session: data.session,
        roles: roles?.map(r => r.role) || [],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Password reset
  router.post('/reset-password', async (req, res) => {
    try {
      const { email } = req.body;
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Password reset email sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
