// Staff Routes (v2) - with schedules and attendance
const express = require('express');

module.exports = function (supabase, requireRole) {
  const router = express.Router();

  // Get all staff
  router.get('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('staff')
        .select('*, staff_schedules(*)').order('full_name');
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single staff member
  router.get('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('staff')
        .select('*, staff_schedules(*), staff_attendance(*)').eq('id', req.params.id).single();
      if (error) return res.status(404).json({ error: 'Staff not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create staff member
  router.post('/', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('staff').insert(req.body).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update staff member
  router.patch('/:id', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('staff')
        .update(req.body).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update staff status (on_duty, on_break, off_duty)
  router.patch('/:id/status', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { status } = req.body;
      const { data, error } = await supabase.from('staff')
        .update({ status }).eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete staff member
  router.delete('/:id', requireRole('admin'), async (req, res) => {
    try {
      const { error } = await supabase.from('staff').delete().eq('id', req.params.id);
      if (error) return res.status(400).json({ error: error.message });
      res.json({ message: 'Staff member removed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- SCHEDULES ---

  // Set schedule
  router.post('/:id/schedule', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { schedules } = req.body; // array of { day_of_week, shift_start, shift_end }
      // Remove existing
      await supabase.from('staff_schedules').delete().eq('staff_id', req.params.id);
      // Insert new
      const rows = schedules.map(s => ({ staff_id: req.params.id, ...s }));
      const { data, error } = await supabase.from('staff_schedules').insert(rows).select();
      if (error) return res.status(400).json({ error: error.message });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- ATTENDANCE ---

  // Clock in
  router.post('/:id/clock-in', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data, error } = await supabase.from('staff_attendance')
        .insert({ staff_id: req.params.id }).select().single();
      if (error) return res.status(400).json({ error: error.message });
      // Update status to on_duty
      await supabase.from('staff').update({ status: 'on_duty' }).eq('id', req.params.id);
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Clock out
  router.patch('/attendance/:id/clock-out', requireRole('admin', 'manager'), async (req, res) => {
    try {
      const { data: attendance } = await supabase.from('staff_attendance')
        .select('*').eq('id', req.params.id).single();
      const hours = (new Date() - new Date(attendance.clock_in)) / 3600000;

      const { data, error } = await supabase.from('staff_attendance')
        .update({ clock_out: new Date().toISOString(), total_hours: Math.round(hours * 100) / 100 })
        .eq('id', req.params.id).select().single();
      if (error) return res.status(400).json({ error: error.message });

      await supabase.from('staff').update({ status: 'off_duty' }).eq('id', attendance.staff_id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

// noop: harmless touch