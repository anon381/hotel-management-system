// Reservation Routes
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Get reservations
  router.get('/', async (req, res) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles').select('role').eq('user_id', req.user.id).in('role', ['admin']);

      let query = supabase
        .from('reservations')
        .select('*, restaurant_tables(table_number, zone), profiles(full_name)')
        .order('reservation_date', { ascending: true });

      if (!roles || roles.length === 0) {
        query = query.eq('customer_id', req.user.id);
      }

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create reservation
  router.post('/', async (req, res) => {
    try {
      const { table_id, reservation_date, reservation_time, guest_count, special_requests } = req.body;

      // Check table availability
      const { data: existing } = await supabase
        .from('reservations')
        .select('id')
        .eq('table_id', table_id)
        .eq('reservation_date', reservation_date)
        .eq('reservation_time', reservation_time)
        .in('status', ['pending', 'confirmed']);

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Table already reserved for this time slot' });
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          customer_id: req.user.id,
          table_id,
          reservation_date,
          reservation_time,
          guest_count,
          special_requests,
        })
        .select('*, restaurant_tables(table_number, zone)')
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update reservation status
  router.patch('/:id', async (req, res) => {
    try {
      const { status } = req.body;
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
