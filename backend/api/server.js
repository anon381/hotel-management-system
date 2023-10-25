// =============================================
// Café X - Node.js Express API Server (v2)
// Complete backend for all features
// =============================================
// Setup:
//   npm install express cors dotenv @supabase/supabase-js
//   node backend/api/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow CORS for local development and the deployed frontend
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow any localhost port, the specific Vercel deployment, or the deployed frontend URL env
    if (!origin || 
        (origin && origin.startsWith('http://localhost:')) || 
        origin === 'https://tableza.vercel.app' || 
        origin === process.env.FRONTEND_URL || 
        process.env.FRONTEND_URL === '*') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ==================== MIDDLEWARE ====================

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
}

function requireRole(...roles) {
  return async (req, res, next) => {
    const { data } = await supabase
      .from('user_roles').select('role').eq('user_id', req.user.id).in('role', roles);
    if (!data || data.length === 0) return res.status(403).json({ error: 'Insufficient permissions' });
    req.userRoles = data.map(r => r.role);
    next();
  };
}

// Activity logger helper
async function logActivity(userId, action, entityType, entityId, details = {}) {
  await supabase.from('activity_log').insert({ user_id: userId, action, entity_type: entityType, entity_id: entityId, details });
}

// ==================== ROUTES ====================

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter(supabase));

const menuRouter = require('./routes/menu');
app.use('/api/menu', authenticate, menuRouter(supabase, requireRole, logActivity));

const ordersRouter = require('./routes/orders');
app.use('/api/orders', authenticate, ordersRouter(supabase, requireRole, logActivity));

const reservationsRouter = require('./routes/reservations');
app.use('/api/reservations', authenticate, reservationsRouter(supabase, requireRole, logActivity));

const tablesRouter = require('./routes/tables');
app.use('/api/tables', authenticate, tablesRouter(supabase, requireRole));

const paymentsRouter = require('./routes/payments');
app.use('/api/payments', authenticate, paymentsRouter(supabase, requireRole, logActivity));

const inventoryRouter = require('./routes/inventory');
app.use('/api/inventory', authenticate, inventoryRouter(supabase, requireRole, logActivity));

const staffRouter = require('./routes/staff');
app.use('/api/staff', authenticate, staffRouter(supabase, requireRole));

const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', authenticate, notificationsRouter(supabase));

const reportsRouter = require('./routes/reports');
app.use('/api/reports', authenticate, reportsRouter(supabase, requireRole));

const favoritesRouter = require('./routes/favorites');
app.use('/api/favorites', authenticate, favoritesRouter(supabase));

const reviewsRouter = require('./routes/reviews');
app.use('/api/reviews', authenticate, reviewsRouter(supabase, requireRole));

const loyaltyRouter = require('./routes/loyalty');
app.use('/api/loyalty', authenticate, loyaltyRouter(supabase, requireRole));

const feedbackRouter = require('./routes/feedback');
app.use('/api/feedback', authenticate, feedbackRouter(supabase, requireRole));

const promotionsRouter = require('./routes/promotions');
app.use('/api/promotions', authenticate, promotionsRouter(supabase, requireRole, logActivity));

const usersRouter = require('./routes/users');
app.use('/api/users', authenticate, usersRouter(supabase, requireRole, logActivity));

const dashboardRouter = require('./routes/dashboard');
app.use('/api/dashboard', authenticate, dashboardRouter(supabase, requireRole));

const gamificationRouter = require('./routes/gamification');
app.use('/api/coins', authenticate, gamificationRouter(supabase, requireRole, logActivity));

const trackingRouter = require('./routes/tracking');
app.use('/api/tracking', authenticate, trackingRouter(supabase, requireRole));

const referralsRouter = require('./routes/referrals');
app.use('/api/referrals', authenticate, referralsRouter(supabase, requireRole, logActivity));

const dealsRouter = require('./routes/deals');
app.use('/api/deals', authenticate, dealsRouter(supabase, requireRole, logActivity));

const recommendationsRouter = require('./routes/recommendations');
app.use('/api/recommendations', authenticate, recommendationsRouter(supabase, requireRole));

const schedulingRouter = require('./routes/scheduling');
app.use('/api/scheduling', authenticate, schedulingRouter(supabase, requireRole));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '3.0', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`Café X API running on port ${PORT}`));
module.exports = app;

// noop: harmless touch