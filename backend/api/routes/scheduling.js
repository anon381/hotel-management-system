// Staff Scheduling Routes
module.exports = function(supabase, requireRole) {
  const router = require('express').Router();

  // GET /scheduling/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
  router.get('/calendar', requireRole('admin', 'manager'), async (req, res) => {
    const { start, end } = req.query;
    let query = supabase.from('staff_schedule_calendar')
      .select('*, staff:staff(full_name, role, avatar)');
    if (start) query = query.gte('schedule_date', start);
    if (end) query = query.lte('schedule_date', end);
    const { data, error } = await query.order('schedule_date');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // GET /scheduling/my-schedule - staff view own schedule
  router.get('/my-schedule', async (req, res) => {
    const { data: staffRecord } = await supabase
      .from('staff').select('id').eq('user_id', req.user.id).single();
    if (!staffRecord) return res.status(404).json({ error: 'Staff record not found' });

    const { data, error } = await supabase
      .from('staff_schedule_calendar').select('*')
      .eq('staff_id', staffRecord.id)
      .gte('schedule_date', new Date().toISOString().slice(0, 10))
      .order('schedule_date');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // POST /scheduling/bulk - create schedules for a week
  router.post('/bulk', requireRole('admin', 'manager'), async (req, res) => {
    const { schedules } = req.body; // [{staff_id, schedule_date, shift_start, shift_end, ...}]
    if (!schedules || !Array.isArray(schedules)) return res.status(400).json({ error: 'schedules array required' });

    const { data, error } = await supabase
      .from('staff_schedule_calendar').upsert(schedules, { onConflict: 'staff_id,schedule_date' }).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // PATCH /scheduling/:id - update single schedule entry
  router.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
    const { data, error } = await supabase
      .from('staff_schedule_calendar').update(req.body).eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  });

  // POST /scheduling/:id/swap-request - staff request shift swap
  router.post('/:id/swap-request', async (req, res) => {
    const { swap_with_staff_id } = req.body;
    const { data, error } = await supabase
      .from('staff_schedule_calendar')
      .update({ swap_requested: true, swap_with_staff_id })
      .eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    // Notify admin
    const admins = await supabase.from('user_roles').select('user_id').in('role', ['admin', 'manager']);
    if (admins.data) {
      const notifications = admins.data.map(a => ({
        user_id: a.user_id, type: 'system',
        title: 'Shift Swap Request', message: 'A staff member has requested a shift swap.'
      }));
      await supabase.from('notifications').insert(notifications);
    }
    res.json(data);
  });

  // PATCH /scheduling/:id/approve-swap - admin approve swap
  router.patch('/:id/approve-swap', requireRole('admin', 'manager'), async (req, res) => {
    const { data: schedule } = await supabase
      .from('staff_schedule_calendar').select('*').eq('id', req.params.id).single();
    if (!schedule || !schedule.swap_requested) return res.status(400).json({ error: 'No swap request' });

    // Swap the staff IDs
    const { error } = await supabase
      .from('staff_schedule_calendar')
      .update({ staff_id: schedule.swap_with_staff_id, swap_requested: false, swap_approved: true, approved_by: req.user.id })
      .eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // DELETE /scheduling/:id
  router.delete('/:id', requireRole('admin', 'manager'), async (req, res) => {
    const { error } = await supabase.from('staff_schedule_calendar').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  return router;
};

// noop: harmless touch