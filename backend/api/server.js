// =============================================
// Café X - Node.js Express API Server
// =============================================
// To run: npm install express cors dotenv @supabase/supabase-js
//         node backend/api/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Auth middleware - extracts user from Bearer token
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
}

// Role check middleware
function requireRole(...roles) {
  return async (req, res, next) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .in('role', roles);

    if (!data || data.length === 0) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    req.userRoles = data.map(r => r.role);
    next();
  };
}

// ==================== ROUTES ====================

// --- AUTH ---
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter(supabase));

// --- MENU ---
const menuRouter = require('./routes/menu');
app.use('/api/menu', authenticate, menuRouter(supabase));

// --- ORDERS ---
const ordersRouter = require('./routes/orders');
app.use('/api/orders', authenticate, ordersRouter(supabase, requireRole));

// --- RESERVATIONS ---
const reservationsRouter = require('./routes/reservations');
app.use('/api/reservations', authenticate, reservationsRouter(supabase, requireRole));

// --- TABLES ---
const tablesRouter = require('./routes/tables');
app.use('/api/tables', authenticate, tablesRouter(supabase, requireRole));

// --- PAYMENTS ---
const paymentsRouter = require('./routes/payments');
app.use('/api/payments', authenticate, paymentsRouter(supabase, requireRole));

// --- INVENTORY ---
const inventoryRouter = require('./routes/inventory');
app.use('/api/inventory', authenticate, inventoryRouter(supabase, requireRole));

// --- STAFF ---
const staffRouter = require('./routes/staff');
app.use('/api/staff', authenticate, staffRouter(supabase, requireRole));

// --- NOTIFICATIONS ---
const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', authenticate, notificationsRouter(supabase));

// --- REPORTS ---
const reportsRouter = require('./routes/reports');
app.use('/api/reports', authenticate, reportsRouter(supabase, requireRole));

// --- FAVORITES ---
const favoritesRouter = require('./routes/favorites');
app.use('/api/favorites', authenticate, favoritesRouter(supabase));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Café X API running on port ${PORT}`));

module.exports = app;
