# Café X - Backend Reference

## Structure

```
backend/
├── database/
│   └── schema.sql          # Complete PostgreSQL schema (tables, RLS, functions, triggers)
├── api/
│   ├── server.js           # Express.js entry point
│   └── routes/
│       ├── auth.js          # Sign up, login, password reset
│       ├── menu.js          # CRUD menu items & categories
│       ├── orders.js        # Create orders, update status, list
│       ├── reservations.js  # Book tables, manage reservations
│       ├── tables.js        # Restaurant table management
│       ├── payments.js      # Process payments, refunds
│       ├── inventory.js     # Stock management, restocking
│       ├── staff.js         # Staff CRUD (admin only)
│       ├── notifications.js # User notifications, mark read
│       ├── reports.js       # Revenue, order stats, top items
│       └── favorites.js     # Customer favorite dishes
└── README.md
```

## Setup

```bash
cd backend
npm init -y
npm install express cors dotenv @supabase/supabase-js
```

Create a `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

## Run the Database Schema

Execute `database/schema.sql` in your PostgreSQL/Supabase SQL editor. It creates:
- 13 tables (profiles, user_roles, menu_items, orders, order_items, payments, reservations, restaurant_tables, favorites, inventory, staff, notifications, menu_categories)
- Row Level Security policies for all tables
- Triggers for auto-updating timestamps and creating profiles on signup
- Helper functions (role checking, order total calculation)

## Run the API

```bash
node api/server.js
```

API runs on `http://localhost:3001`. All routes require Bearer token authentication except health check.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | Public | Create account |
| POST | /api/auth/login | Public | Sign in |
| GET | /api/menu | Auth | List menu items |
| POST | /api/orders | Auth | Place order |
| PATCH | /api/orders/:id/status | Kitchen/Admin | Update order status |
| POST | /api/reservations | Auth | Book table |
| GET | /api/tables | Auth | List tables |
| POST | /api/payments | Auth | Process payment |
| GET | /api/inventory | Kitchen/Admin | View stock |
| GET | /api/reports/revenue | Admin | Revenue report |
| GET | /api/favorites | Auth | User's favorites |
| GET | /api/notifications | Auth | User's notifications |
