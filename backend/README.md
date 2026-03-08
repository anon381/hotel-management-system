# Café X - Complete Backend Reference (v2)

## Structure

```
backend/
├── database/
│   └── schema.sql              # Complete PostgreSQL schema (23 tables, RLS, functions, triggers, seed data)
├── api/
│   ├── server.js               # Express.js entry point with auth middleware
│   └── routes/
│       ├── auth.js             # Signup, login, password reset, profile update
│       ├── menu.js             # CRUD menu items, categories, tags, availability toggle
│       ├── orders.js           # Create orders, status updates, item-level completion, ETA
│       ├── reservations.js     # Book tables, conflict checking, status management
│       ├── tables.js           # Table CRUD, current order/reservation info
│       ├── payments.js         # Process payments, tips, refunds
│       ├── inventory.js        # Stock management, restocking with log
│       ├── staff.js            # Staff CRUD, schedules, attendance (clock in/out)
│       ├── notifications.js    # User notifications, batch read, clear
│       ├── reports.js          # Revenue, orders, top items, categories, hourly, customer insights
│       ├── favorites.js        # Customer favorite dishes
│       ├── reviews.js          # Item ratings/reviews, admin moderation
│       ├── loyalty.js          # Points balance, transactions, redeem, admin award
│       ├── feedback.js         # Customer feedback, admin resolve
│       ├── promotions.js       # Promo codes, validation, admin management
│       ├── users.js            # User/role management, activate/deactivate, activity log
│       └── dashboard.js        # Admin dashboard stats, top sellers, kitchen performance
└── README.md
```

## Database Tables (23 total)

| # | Table | Purpose |
|---|-------|---------|
| 1 | profiles | User profiles (auto-created on signup) |
| 2 | user_roles | Role-based access (admin, manager, cashier, kitchen_staff, customer) |
| 3 | menu_categories | Menu category grouping |
| 4 | menu_items | Dishes with pricing, dietary flags, ratings |
| 5 | menu_item_tags | Item tags (Chef's Special, Healthy, Vegetarian, etc.) |
| 6 | restaurant_tables | Table layout with zones and capacity |
| 7 | reservations | Customer table bookings with auto-numbering |
| 8 | orders | Customer orders with totals, discounts, timing |
| 9 | order_items | Individual items per order with special instructions |
| 10 | payments | Payment records with tips and refund support |
| 11 | favorites | Customer saved dishes |
| 12 | reviews | Item ratings and comments |
| 13 | loyalty_transactions | Points earned/redeemed ledger |
| 14 | feedback | Customer feedback (food, service, ambiance) |
| 15 | inventory | Stock items with low-stock alerts |
| 16 | inventory_restock_log | Restock history |
| 17 | staff | Staff members with role, rating, status |
| 18 | staff_schedules | Weekly shift schedules |
| 19 | staff_attendance | Clock in/out tracking |
| 20 | promotions | Promo codes and offers |
| 21 | promotion_redemptions | Promo usage tracking |
| 22 | notifications | In-app notifications |
| 23 | activity_log | Admin audit trail |

## Key Features Covered

- ✅ **Auth**: Signup, login, password reset, profile management
- ✅ **Menu**: Full CRUD, categories, tags, dietary flags, availability toggle
- ✅ **Orders**: Create with items + notes, status tracking, item-level kitchen completion, ETA
- ✅ **Reservations**: Book with conflict checking, auto-numbering, status flow
- ✅ **Tables**: Zone management, live status, current order/reservation lookup
- ✅ **Payments**: Process, tips, refunds, transaction references
- ✅ **Inventory**: Stock tracking, low-stock alerts, restock with logging
- ✅ **Staff**: CRUD, schedules, attendance (clock in/out), status tracking
- ✅ **Notifications**: Per-user, batch read, auto-generated on events
- ✅ **Reviews**: Item ratings, admin moderation, auto-updates avg rating
- ✅ **Loyalty**: Points on orders, welcome bonus, redeem, tier upgrades (bronze→platinum)
- ✅ **Feedback**: Customer feedback, admin resolution tracking
- ✅ **Promotions**: Promo codes, validation, usage limits, per-customer tracking
- ✅ **Users & Roles**: 5 roles (admin, manager, cashier, kitchen_staff, customer)
- ✅ **Reports**: Revenue, order stats, top items, category breakdown, hourly, customer insights
- ✅ **Dashboard**: Live stats function, kitchen performance, top sellers
- ✅ **Activity Log**: Audit trail for admin actions
- ✅ **RLS**: Row-Level Security on all 23 tables

## Setup

```bash
cd backend
npm init -y
npm install express cors dotenv @supabase/supabase-js
```

Create `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## Deploy

1. Run `database/schema.sql` in your PostgreSQL/Supabase SQL editor
2. Set environment variables on your server
3. `node api/server.js`

## API Endpoints (60+)

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | Public | Create account |
| POST | /api/auth/login | Public | Sign in, returns roles + profile |
| POST | /api/auth/reset-password | Public | Send reset email |
| POST | /api/auth/update-password | Public | Set new password |
| GET | /api/auth/me | Bearer | Get current user + profile + roles |
| PATCH | /api/auth/profile | Bearer | Update profile |

### Menu
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/menu | Auth | List items (filter: category, search, available, featured) |
| GET | /api/menu/:id | Auth | Item detail with reviews |
| POST | /api/menu | Admin/Kitchen | Create item with tags |
| PUT | /api/menu/:id | Admin/Kitchen | Update item + tags |
| PATCH | /api/menu/:id/availability | Admin/Kitchen | Toggle availability |
| DELETE | /api/menu/:id | Admin | Delete item |
| GET | /api/menu/categories/all | Auth | List categories |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/orders | Auth | List orders (role-aware) |
| GET | /api/orders/:id | Auth | Order detail |
| POST | /api/orders | Auth | Place order with promo support |
| PATCH | /api/orders/:id/status | Kitchen/Admin | Update status + auto-notify + auto-loyalty |
| PATCH | /api/orders/:id/items/:itemId/complete | Kitchen | Toggle item completion |
| PATCH | /api/orders/:id/eta | Kitchen | Update ETA |

### Reservations, Tables, Payments, Inventory, Staff, Notifications, Reviews, Loyalty, Feedback, Promotions, Users, Dashboard, Reports
(See route files for complete endpoint documentation)
