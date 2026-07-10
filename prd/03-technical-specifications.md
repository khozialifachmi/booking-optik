# 3. Technical Specifications

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Shadcn   │  │ React    │  │ Zustand   │  │ Better Auth   │   │
│  │ UI       │  │ Hook Form│  │ Store     │  │ Client        │   │
│  └────┬─────┘  └────┬─────┘  └────┬──────┘  └──────┬────────┘   │
│       └──────────────┴─────────────┴────────────────┘           │
│                           │                                      │
│                    Next.js App Router                             │
│              (React 19 Server Components)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / Server Actions
┌──────────────────────────┴──────────────────────────────────────┐
│                     SERVER (Next.js API)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Route        │  │ Better Auth  │  │ Queue Service         │   │
│  │ Handlers     │  │ Server       │  │ (FCFS Algorithm)      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         └─────────────────┴─────────────────────┘               │
│                           │                                      │
│                    Supabase Client                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ PostgreSQL Protocol
┌──────────────────────────┴──────────────────────────────────────┐
│                    SUPABASE (Cloud)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ PostgreSQL│  │ Auth*    │  │ Storage  │  │ Row Level     │   │
│  │ Database │  │ (unused) │  │ (Images) │  │ Security      │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
│  * Auth handled by Better Auth, not Supabase Auth                │
└─────────────────────────────────────────────────────────────────┘
```

> **Note**: Supabase is used ONLY for PostgreSQL database and file storage. Authentication is handled entirely by Better Auth.

---

## FCFS Queue Algorithm

```
FUNCTION generate_queue_number(booking_date):
    current_max = SELECT MAX(queue_number)
                  FROM bookings
                  WHERE date = booking_date
                  AND status != 'cancelled'

    RETURN (current_max ?? 0) + 1

FUNCTION calculate_estimated_time(booking_date, queue_position):
    settings = SELECT avg_service_duration, open_time
                FROM queue_settings
                WHERE effective_date <= booking_date
                ORDER BY effective_date DESC
                LIMIT 1

    estimated_time = settings.open_time
                   + (queue_position - 1) × settings.avg_service_duration

    RETURN estimated_time

FUNCTION recalculate_queue(booking_date):
    active_bookings = SELECT * FROM bookings
                      WHERE date = booking_date
                      AND status IN ('waiting', 'serving')
                      ORDER BY created_at ASC

    FOR EACH booking IN active_bookings:
        new_position = INDEX + 1
        new_estimated_time = calculate_estimated_time(booking_date, new_position)
        UPDATE booking SET
            queue_number = new_position,
            estimated_service_time = new_estimated_time
```

---

## Database Schema (Supabase PostgreSQL)

### Table: `users` (managed by Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `TEXT` | PK | Better Auth user ID |
| `name` | `TEXT` | NOT NULL | Full name |
| `email` | `TEXT` | UNIQUE, NOT NULL | Login email |
| `email_verified` | `BOOLEAN` | DEFAULT false | Email verification status |
| `image` | `TEXT` | NULLABLE | Profile image URL |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Registration time |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Last update time |

### Table: `sessions` (managed by Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `TEXT` | PK | Session ID |
| `user_id` | `TEXT` | FK → users.id | Session owner |
| `token` | `TEXT` | UNIQUE | Session token |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Expiration time |
| `ip_address` | `TEXT` | NULLABLE | Client IP |
| `user_agent` | `TEXT` | NULLABLE | Client user agent |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Session start |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | Last activity |

### Table: `accounts` (managed by Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `TEXT` | PK | Account ID |
| `user_id` | `TEXT` | FK → users.id | Owner |
| `account_id` | `TEXT` | NOT NULL | Provider account ID |
| `provider_id` | `TEXT` | NOT NULL | Auth provider |
| `access_token` | `TEXT` | NULLABLE | OAuth token |
| `refresh_token` | `TEXT` | NULLABLE | OAuth refresh |
| `expires_at` | `TIMESTAMPTZ` | NULLABLE | Token expiry |
| `password` | `TEXT` | NULLABLE | Hashed password |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | |

### Table: `verifications` (managed by Better Auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `TEXT` | PK | Verification ID |
| `identifier` | `TEXT` | NOT NULL | Email or token identifier |
| `value` | `TEXT` | NOT NULL | Verification value |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | Expiry time |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | |

### Table: `user_profiles` (custom)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Profile ID |
| `user_id` | `TEXT` | FK → users.id, UNIQUE | Better Auth user ref |
| `role` | `TEXT` | NOT NULL, DEFAULT 'customer' | 'customer' or 'admin' |
| `phone` | `TEXT` | NOT NULL | Indonesian phone (08xx) |
| `address` | `TEXT` | NULLABLE | Address |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | |

### Table: `bookings` (custom)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | Booking ID |
| `user_id` | `TEXT` | FK → users.id | Customer ref |
| `booking_date` | `DATE` | NOT NULL | Appointment date |
| `queue_number` | `INTEGER` | NOT NULL | FCFS position |
| `service_type` | `TEXT` | NOT NULL | Service category |
| `estimated_service_time` | `TIMESTAMPTZ` | NOT NULL | Calculated arrival time |
| `actual_service_time` | `TIMESTAMPTZ` | NULLABLE | Actual start time |
| `status` | `TEXT` | NOT NULL, DEFAULT 'waiting' | waiting/serving/completed/cancelled |
| `notes` | `TEXT` | NULLABLE | Customer notes |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | Registration timestamp (FCFS key) |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | |

**Indexes:**
- `idx_bookings_date_queue` on `(booking_date, queue_number)` — fast queue lookup
- `idx_bookings_user_date` on `(user_id, booking_date)` — duplicate check
- `idx_bookings_status` on `(status)` — filter by status

**Constraints:**
- `UNIQUE(booking_date, queue_number)` — no duplicate queue numbers per date
- `UNIQUE(user_id, booking_date)` — one booking per customer per date
- `CHECK(status IN ('waiting', 'serving', 'completed', 'cancelled'))`
- `CHECK(service_type IN ('pemeriksaan_mata', 'pembuatan_kacamata', 'kontrol_kacamata'))`

### Table: `queue_settings` (custom)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | |
| `avg_service_duration` | `INTEGER` | NOT NULL, DEFAULT 20 | Minutes per patient |
| `open_time` | `TIME` | NOT NULL, DEFAULT '08:00' | Store opening |
| `close_time` | `TIME` | NOT NULL, DEFAULT '17:00' | Store closing |
| `max_bookings_per_day` | `INTEGER` | NOT NULL, DEFAULT 30 | Max daily slots |
| `effective_date` | `DATE` | NOT NULL | Settings apply from |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | |

---

## Integration Points

### Better Auth (Authentication)
- **Server**: `lib/auth.ts` — `betterAuth()` instance with PostgreSQL (Supabase) adapter
- **Client**: `lib/auth-client.ts` — `createAuthClient()` from `better-auth/react`
- **Route Handler**: `app/api/auth/[...all]/route.ts` — catch-all via `toNextJsHandler()`
- **Middleware**: `middleware.ts` — session validation on protected routes
- **Role Check**: Custom `user_profiles.role` column queried after session validation

### Supabase (Database + Storage)
- **Database**: Direct PostgreSQL connection via `@supabase/supabase-js` or raw `pg` pool
- **Storage**: Supabase Storage buckets for profile images
- **Connection**: Server-side only via environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- **No Supabase Auth**: Authentication is entirely handled by Better Auth

### React Hook Form + Zod (Form Validation)
- **Schemas**: Defined in `lib/validations/` directory
- **Integration**: `zodResolver` connects Zod schemas to React Hook Form
- **Server Validation**: Same Zod schemas reused in API route handlers

---

## Security & Privacy

### Authentication Security
- Passwords hashed via Better Auth (bcrypt/argon2)
- HTTP-only, Secure, SameSite=Lax session cookies
- CSRF protection via Better Auth's built-in mechanisms
- Session expiry: 7 days (configurable)

### Authorization
- Middleware-level role checks on every protected route
- Server-side session validation before any data mutation
- Row-level checks: customers can only view/cancel their own bookings

### Data Privacy
- Phone numbers and personal data stored only in PostgreSQL
- No client-side caching of sensitive data in Zustand
- Environment variables for all secrets (never committed to git)
- `.env.local` in `.gitignore`

### Input Validation
- All user inputs validated with Zod schemas on both client and server
- SQL injection prevented via parameterized queries (Supabase client)
- XSS prevented via React's default escaping + Content Security Policy headers
