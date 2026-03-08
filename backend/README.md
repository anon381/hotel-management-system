# Café X - Backend API & Database (v3 - FINAL)

Complete production-ready backend for the Café X restaurant management system.

## Architecture

- **Database**: PostgreSQL (Supabase compatible)
- **API**: Node.js + Express
- **Auth**: Supabase Auth (JWT-based)
- **Security**: Row Level Security (RLS) on all 27 tables

## Quick Start

```bash
# 1. Install dependencies
cd backend
npm install express cors dotenv @supabase/supabase-js

# 2. Set environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run the SQL schema on your Supabase project
# Copy backend/database/schema.sql → Supabase SQL Editor → Run

# 4. Start the server
node api/server.js
```

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## Database Schema (27 Tables)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `profiles` | User profiles (auto-created on signup) with loyalty, tier, preferences |
| 2 | `user_roles` | Role-based access (admin, manager, cashier, kitchen_staff, customer) |
| 3 | `menu_categories` | Menu sections (Breakfast, Lunch, Dinner, etc.) |
| 4 | `menu_items` | All dishes with pricing, nutrition, allergens, dietary flags |
| 5 | `menu_item_tags` | Labels like "Chef's Special", "Popular", "Healthy" |
| 6 | `menu_item_ingredients` | Links dishes to inventory for auto-deduction |
| 7 | `restaurant_tables` | Table layout with zones, capacity, shape, floor |
| 8 | `reservations` | Bookings with conflict checking, auto-numbered |
| 9 | `orders` | Dine-in, takeaway, delivery orders with full lifecycle |
| 10 | `order_items` | Individual items per order with kitchen-level completion |
| 11 | `payments` | Payment processing with tips, refunds, receipts |
| 12 | `favorites` | Customer saved favorites |
| 13 | `reviews` | Item ratings & comments with staff replies |
| 14 | `loyalty_transactions` | Points earned/redeemed ledger |
| 15 | `feedback` | General restaurant feedback (food, service, ambiance) |
| 16 | `customer_addresses` | Delivery addresses per customer |
| 17 | `inventory` | Stock tracking with low-stock & expiry alerts |
| 18 | `inventory_restock_log` | Restock history with supplier & invoice info |
| 19 | `inventory_usage_log` | Consumption tracking per order + waste |
| 20 | `staff` | Employee records with emergency contacts |
| 21 | `staff_schedules` | Weekly shift schedules |
| 22 | `staff_attendance` | Clock in/out with overtime tracking |
| 23 | `promotions` | Coupons, discounts, offers with per-customer limits |
| 24 | `promotion_redemptions` | Tracks who used which promo |
| 25 | `notifications` | Real-time notifications per user |
| 26 | `activity_log` | Admin audit trail |
| 27 | `app_settings` | Configurable restaurant settings (tax, hours, delivery radius) |

## API Endpoints (70+)

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | - | Register new user |
| POST | `/login` | - | Sign in, returns session + roles |
| POST | `/logout` | ✓ | Sign out |
| POST | `/reset-password` | - | Send reset email |
| POST | `/update-password` | ✓ | Set new password via reset link |
| POST | `/change-password` | ✓ | Change password (authenticated) |
| GET | `/me` | ✓ | Current user profile + roles + addresses |
| PATCH | `/profile` | ✓ | Update profile (name, phone, avatar, preferences) |
| GET | `/addresses` | ✓ | List delivery addresses |
| POST | `/addresses` | ✓ | Add delivery address |
| PATCH | `/addresses/:id` | ✓ | Update address |
| DELETE | `/addresses/:id` | ✓ | Remove address |

### Menu (`/api/menu`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | List items (filter: category, search, featured, available) |
| GET | `/:id` | ✓ | Item detail + reviews |
| POST | `/` | Admin/Kitchen | Create item with tags |
| PUT | `/:id` | Admin/Kitchen | Update item |
| PATCH | `/:id/availability` | Admin/Kitchen | Toggle availability |
| DELETE | `/:id` | Admin | Delete item |
| GET | `/categories/all` | ✓ | List all categories |
| POST | `/categories` | Admin | Create category |

### Orders (`/api/orders`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | List orders (filter: status, type, date range) |
| GET | `/:id` | ✓ | Order detail + items + payments |
| POST | `/` | ✓ | Create order (dine-in/takeaway/delivery + promo) |
| PATCH | `/:id/status` | Staff | Update status (notify customer, award points) |
| PATCH | `/:orderId/items/:itemId/complete` | Kitchen | Mark item done |
| PATCH | `/:id/eta` | Kitchen | Update prep time |
| POST | `/:id/reorder` | ✓ | Duplicate previous order |

### Reservations (`/api/reservations`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | List (own for customers, all for staff) |
| POST | `/` | ✓ | Create with conflict check |
| PATCH | `/:id` | ✓ | Update status (confirm/cancel/seat/complete) |

### Tables (`/api/tables`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | List tables (filter: zone, status) |
| GET | `/:id` | ✓ | Table detail + today's reservations + current order |
| POST | `/` | Admin | Create table |
| PATCH | `/:id` | Admin | Update table |
| DELETE | `/:id` | Admin | Deactivate table |

### Payments (`/api/payments`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | List payments |
| POST | `/` | ✓ | Process payment with tips |
| PATCH | `/:id/refund` | Admin | Refund payment |

### Inventory (`/api/inventory`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Staff | List (filter: low_stock, category, expiring_soon) |
| GET | `/:id` | Staff | Detail + restock history + usage + linked menu items |
| POST | `/` | Admin | Create item |
| PATCH | `/:id` | Staff | Update item |
| DELETE | `/:id` | Admin | Delete item |
| POST | `/:id/restock` | Admin | Restock with log |
| GET | `/:id/restock-history` | Admin | Restock log |
| POST | `/:id/usage` | Staff | Log waste/adjustment |
| GET | `/ingredients/:menuItemId` | Staff | Get dish ingredients |
| PUT | `/ingredients/:menuItemId` | Staff | Set dish ingredients |

### Staff (`/api/staff`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all staff with schedules |
| GET | `/:id` | Admin | Staff detail + attendance |
| POST | `/` | Admin | Create staff member |
| PATCH | `/:id` | Admin | Update staff |
| PATCH | `/:id/status` | Admin | Toggle duty status |
| DELETE | `/:id` | Admin | Remove staff |
| POST | `/:id/schedule` | Admin | Set weekly schedule |
| POST | `/:id/clock-in` | Admin | Clock in |
| PATCH | `/attendance/:id/clock-out` | Admin | Clock out |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | List + unread count (filter: type, unread_only) |
| PATCH | `/:id/read` | ✓ | Mark as read |
| PATCH | `/read-all` | ✓ | Mark all as read |
| DELETE | `/clear-read` | ✓ | Clear read notifications |

### Reviews (`/api/reviews`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/item/:menuItemId` | ✓ | Reviews for a dish |
| GET | `/my` | ✓ | My reviews |
| POST | `/` | ✓ | Submit review (earns 10 loyalty points) |
| GET | `/all` | Admin | All reviews |
| PATCH | `/:id/visibility` | Admin | Show/hide review |

### Loyalty (`/api/loyalty`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my` | ✓ | Points balance + transactions |
| POST | `/redeem` | ✓ | Redeem points |
| GET | `/all` | Admin | All customers loyalty data |
| POST | `/award` | Admin | Manually award points |

### Favorites (`/api/favorites`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | My favorites with full item data |
| POST | `/` | ✓ | Add to favorites |
| DELETE | `/:menu_item_id` | ✓ | Remove from favorites |
| GET | `/check/:menu_item_id` | ✓ | Check if favorited |

### Feedback (`/api/feedback`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✓ | Submit feedback |
| GET | `/my` | ✓ | My feedback |
| GET | `/all` | Admin | All feedback (filter: resolved) |
| PATCH | `/:id/resolve` | Admin | Resolve feedback |

### Promotions (`/api/promotions`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✓ | Active promotions |
| POST | `/validate` | ✓ | Validate promo code |
| POST | `/` | Admin | Create promotion |
| GET | `/all` | Admin | All promotions with redemption counts |
| PATCH | `/:id` | Admin | Update promotion |

### Reports (`/api/reports`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/revenue` | Admin | Revenue by method & date range |
| GET | `/orders` | Admin | Order stats by status |
| GET | `/top-items` | Admin | Top selling items |
| GET | `/categories` | Admin | Revenue by food category |
| GET | `/customers` | Admin | Top customers by spend |
| GET | `/hourly` | Admin | Hourly order distribution |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Admin | Full dashboard stats (24 metrics) |
| GET | `/top-sellers` | Admin | Best selling items |
| GET | `/revenue` | Admin | Revenue analytics |
| GET | `/kitchen-stats` | Kitchen | Kitchen performance |
| GET | `/customer-stats` | Admin | Customer analytics |
| GET | `/settings` | Admin | App settings |
| PATCH | `/settings` | Admin | Update settings |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | All users with roles |
| GET | `/:id` | Admin | User detail + orders + loyalty |
| POST | `/:id/roles` | Admin | Assign role |
| DELETE | `/:id/roles/:role` | Admin | Remove role |
| PATCH | `/:id/deactivate` | Admin | Ban user |
| PATCH | `/:id/activate` | Admin | Unban user |
| DELETE | `/:id` | Admin | Delete user |
| GET | `/activity/log` | Admin | Activity audit log |

## Key Features

### Automated Workflows
- **Signup**: Auto-creates profile + assigns customer role + 200 welcome points + notification
- **Order completion**: Awards loyalty points, deducts inventory, updates membership tier, notifies customer
- **Review submitted**: Earns 10 bonus points, updates dish average rating
- **All item completion**: Auto-marks order as "ready"
- **Reservation created**: Auto-generates reservation number, notifies admin

### Security
- RLS on every table
- `has_role()` security definer function prevents recursive RLS
- Role-based middleware on all API routes
- 5 roles: admin, manager, cashier, kitchen_staff, customer

### Membership Tiers
| Tier | Lifetime Spend |
|------|---------------|
| Bronze | $0+ |
| Silver | $500+ |
| Gold | $2,000+ |
| Platinum | $5,000+ |

## Deployment

1. Create a Supabase project
2. Run `schema.sql` in the SQL Editor
3. Deploy the Node.js API to your server (Railway, Render, VPS, etc.)
4. Set environment variables
5. Update `FRONTEND_URL` to your deployed frontend URL
