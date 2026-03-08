// Reservation Routes (v2) - with conflict checking
const express = require('express');

module.exports = function (supabase, requireRole, logActivity) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const { data: roles } = await supabase.from('user_roles').select('role')
        .eq('user_id', req.user.id).in('role', ['admin', 'manager']);

      let query = supabase.from('reservations')
        .select('*, restaurant_tables(table_number, zone, capacity), profiles(full_name, phone)')
        .order('reservation_date', { ascending: true });

      if (!roles || roles.length === 0) query = query.eq('customer_id', req.user.id);

      const { data, error } = await query;
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { table_id, reservation_date, reservation_time, guest_count, special_requests } = req.body;
      if (!table_id || !reservation_date || !reservation_time) {
        return res.status(400).json({ error: 'Table, date, and time are required' });
      }

      // Check conflicts
      const { data: existing } = await supabase.from('reservations')
        .select('id').eq('table_id', table_id).eq('reservation_date', reservation_date)
        .eq('reservation_time', reservation_time).in('status', ['pending', 'confirmed']);

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Table already reserved for this time slot' });
      }

      const { data, error } = await supabase.from('reservations')
        .insert({ customer_id: req.user.id, table_id, reservation_date, reservation_time, guest_count, special_requests })
        .select('*, restaurant_tables(table_number, zone)').single();

      if (error) return res.status(400).json({ error: error.message });

      // Notify admins
      const { data: admins } = await supabase.from('user_roles').select('user_id').in('role', ['admin', 'manager']);
      if (admins) {
        await supabase.from('notifications').insert(admins.map(a => ({
          user_id: a.user_id, type: 'reservation', title: 'New Reservation',
          message: `${data.reservation_number} — ${guest_count} guests on ${reservation_date} at ${reservation_time}`,
          metadata: { reservation_id: data.id },
        })));
      }

      await logActivity(req.user.id, 'reservation_created', 'reservation', data.id);
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update status (confirm, cancel, seat, complete)
  router.patch('/:id', async (req, res) => {
    try {
      const { status } = req.body;
      const { data, error } = await supabase.from('reservations')
        .update({ status }).eq('id', req.params.id).select('*, profiles(full_name)').single();
      if (error) return res.status(400).json({ error: error.message });

      // Notify customer on status change
      if (data.customer_id) {
        const msgs = { confirmed: 'Your reservation is confirmed!', cancelled: 'Your reservation was cancelled.', seated: 'Welcome! You are now seated.' };
        if (msgs[status]) {
          await supabase.from('notifications').insert({
            user_id: data.customer_id, type: 'reservation', title: 'Reservation Update',
            message: msgs[status], metadata: { reservation_id: data.id },
          });
        }
      }

      // Update table status
      if (status === 'seated' && data.table_id) {
        await supabase.from('restaurant_tables').update({ status: 'occupied' }).eq('id', data.table_id);
      }
      if ((status === 'completed' || status === 'cancelled' || status === 'no_show') && data.table_id) {
        await supabase.from('restaurant_tables').update({ status: 'available' }).eq('id', data.table_id);
      }

      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
