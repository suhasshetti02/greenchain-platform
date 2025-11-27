# GreenChain Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                             │
│                   (http://localhost:3000)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (React 19)                      │  │
│  │                                                          │  │
│  │  ├─ /login                                              │  │
│  │  ├─ /register                                           │  │
│  │  ├─ /dashboard                                          │  │
│  │  ├─ /donations (list)                                  │  │
│  │  ├─ /donations/[id] (detail)                           │  │
│  │  ├─ /donations/create                                  │  │
│  │  └─ /verify/[eventId]                                  │  │
│  │                                                          │  │
│  │  Authentication: JWT in localStorage                    │  │
│  │  API Client: lib/api.js (wrapper)                      │  │
│  │  State: AuthProvider + useAuth hook                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ▼
                    HTTP/JSON APIs
                   (localhost:3001)
┌─────────────────────────────────────────────────────────────────┐
│                    Node.js Backend                              │
│                    (Express Server)                             │
│                   http://localhost:3001                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Authentication Layer                        │  │
│  │  ├─ POST /api/auth/register (bcrypt hashing)           │  │
│  │  └─ POST /api/auth/login (JWT generation)              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Donation Management Layer                    │  │
│  │  ├─ GET /api/donations (list with filters)             │  │
│  │  ├─ GET /api/donations/:id (details)                   │  │
│  │  ├─ POST /api/donations (create + image upload)        │  │
│  │  └─ POST /api/donations/:id/claim (claim)              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Verification Layer (Blockchain Ready)        │  │
│  │  ├─ GET /api/verify/:eventId (fetch verification)      │  │
│  │  └─ POST /api/verify/:eventId/verify (record)          │  │
│  │      TODO: recordDonation(donationId, dataHash)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Middleware & Utilities                          │  │
│  │  ├─ JWT verification middleware                         │  │
│  │  ├─ Error handling                                      │  │
│  │  ├─ Input validation                                    │  │
│  │  └─ Supabase client initialization                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ▼
                    PostgreSQL + Storage
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase (Backend)                           │
│                   https://...supabase.co                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             PostgreSQL Database                         │  │
│  │                                                          │  │
│  │  Tables (with RLS):                                    │  │
│  │  ├─ users                                              │  │
│  │  │  ├─ id (uuid)                                      │  │
│  │  │  ├─ email (unique)                                 │  │
│  │  │  ├─ password_hash                                  │  │
│  │  │  ├─ name                                           │  │
│  │  │  ├─ role (donor|receiver|volunteer)               │  │
│  │  │  └─ timestamps                                     │  │
│  │  │                                                     │  │
│  │  ├─ donations                                          │  │
│  │  │  ├─ id (uuid)                                      │  │
│  │  │  ├─ donor_id (FK → users)                         │  │
│  │  │  ├─ title, category                               │  │
│  │  │  ├─ quantity_lbs, unit                            │  │
│  │  │  ├─ expiry_date, status                           │  │
│  │  │  ├─ location, image_url                           │  │
│  │  │  ├─ notes                                          │  │
│  │  │  └─ timestamps                                     │  │
│  │  │                                                     │  │
│  │  ├─ claims                                             │  │
│  │  │  ├─ id (uuid)                                      │  │
│  │  │  ├─ donation_id (FK → donations)                  │  │
│  │  │  ├─ receiver_id (FK → users)                      │  │
│  │  │  ├─ claimed_at, status                            │  │
│  │  │  └─ timestamps                                     │  │
│  │  │                                                     │  │
│  │  └─ verification_events                                │  │
│  │     ├─ id (uuid)                                      │  │
│  │     ├─ donation_id (FK → donations)                  │  │
│  │     ├─ event_type (pickup|delivery)                  │  │
│  │     ├─ verification_code (unique)                    │  │
│  │     ├─ scheduled_for, verified_at                    │  │
│  │     ├─ data_hash                                      │  │
│  │     ├─ tx_hash (← blockchain)                        │  │
│  │     └─ notes                                          │  │
│  │                                                          │  │
│  │  Indexes: id, email, status, foreign keys             │  │
│  │  RLS Policies: 10+ restrictive policies               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Storage (Supabase)                          │  │
│  │                                                          │  │
│  │  Bucket: donations/ (public read)                      │  │
│  │  └─ donations/{userId}/{timestamp}-{filename}         │  │
│  │     ├─ Public URL: https://.../{path}                │  │
│  │     └─ Stored in DB as image_url                      │  │
│  │                                                          │  │
│  │  Policies:                                             │  │
│  │  ├─ Public can read (GET)                             │  │
│  │  ├─ Authenticated can upload (INSERT)                 │  │
│  │  └─ Users can update own (UPDATE)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ▼ (Future)
                    Blockchain Network
                   (Integration Point)
```

## Data Flow: User Registration

```
User Input (Frontend)
    ↓
Register Form (register/page.jsx)
    ↓
Validation (6+ char password, etc.)
    ↓
API Call: POST /api/auth/register
    ↓
Backend: Extract email, password, name, role
    ↓
Validation: Check for required fields
    ↓
Hash Password: bcrypt.hash(password, 10)
    ↓
Database: INSERT into users table
    ↓
JWT Generation: sign({id, email, role})
    ↓
Response: { token, user: {id, email, name, role} }
    ↓
Frontend: Store in localStorage
    ↓
Redirect: /dashboard
```

## Data Flow: Create Donation

```
User Input (Frontend)
    ↓
Donation Form (donations/create/page.jsx)
    ↓
Check Auth: Must have valid token
    ↓
FormData: { title, category, quantity_lbs, image, ... }
    ↓
API Call: POST /api/donations (multipart/form-data)
    ↓
Backend JWT Verification: Extract user ID from token
    ↓
Supabase Storage Upload:
    ├─ File: buffer from request
    ├─ Path: donations/{userId}/{timestamp}-{filename}
    └─ Get: Public URL
    ↓
Database INSERT:
    ├─ donations { donor_id, title, ..., image_url, status }
    └─ verification_events { donation_id, event_type: pickup, ... }
    ↓
Response: { message, donation: {...} }
    ↓
Frontend: Show success
    ↓
Redirect: /donations
```

## Data Flow: Claim Donation

```
Receiver View (Frontend)
    ↓
Click: "Claim Donation"
    ↓
API Call: POST /api/donations/:id/claim
    ↓
Backend JWT Verification: Extract receiver_id from token
    ↓
Database Checks:
    ├─ Find donation
    ├─ Check status = available
    └─ Check no existing claim
    ↓
Database INSERT:
    └─ claims { donation_id, receiver_id, status: pending }
    ↓
Database UPDATE:
    └─ donations SET status = claimed WHERE id = :id
    ↓
Response: { message, claim: {...} }
    ↓
Frontend: Show success message
    ↓
UI Update: Button disabled, status changed
```

## Data Flow: Verify Donation

```
Volunteer/Receiver Input (Frontend)
    ↓
Go to: /verify/[verification-code]
    ↓
Fetch Event: GET /api/verify/:code
    ↓
Backend:
    ├─ Find verification_event WHERE verification_code = :code
    ├─ Join donation info
    └─ Return data
    ↓
Frontend: Display donation + details
    ↓
Click: "Confirm Verification"
    ↓
API Call: POST /api/verify/:code/verify
    ↓
Backend:
    ├─ Generate dataHash from donation info
    ├─ TODO: Call blockchain with (donationId, dataHash)
    ├─ Generate mock tx_hash (for now)
    └─ UPDATE verification_events SET verified_at, tx_hash
    ↓
Response: { message, tx_hash }
    ↓
Frontend: Display tx_hash, disable button
    ↓
User: Can see verification recorded with tx_hash
```

## Authentication Flow

```
1. User logs in: email + password
                    ↓
2. Backend: bcrypt.compare(password, password_hash)
                    ↓
3. Match? Generate JWT: jwt.sign({id, email, role}, SECRET)
                    ↓
4. Return: { token: "eyJ...", user: {...} }
                    ↓
5. Frontend: Save to localStorage
                    ↓
6. All Requests: Include Authorization: Bearer {token}
                    ↓
7. Backend: Verify JWT → Extract user ID
                    ↓
8. RLS Policy: WHERE user_id = auth.uid()
                    ↓
9. Response: Only user's own data
                    ↓
10. Expiry: 7 days, then re-login
```

## Security Architecture

```
Frontend Security:
├─ JWT in localStorage (accessible, but cleared on logout)
├─ CORS: Only localhost:3000
├─ Form validation before API calls
└─ Protected page checks (redirect to /login if no token)

Backend Security:
├─ JWT verification middleware
├─ Input validation on all routes
├─ Bcryptjs for password hashing (10 rounds)
├─ CORS whitelist for frontend origin
└─ Error messages don't leak system info

Database Security:
├─ RLS enabled on all tables
├─ Policies check auth.uid() = user_id
├─ Users can only access own data
├─ Donors can only update own donations
└─ Receivers can only claim available donations

Storage Security:
├─ Bucket is public read (images viewable)
├─ Uploads require authentication
├─ Images organized by user: donations/{userId}/{timestamp}
└─ Public URLs stored in database
```

## Integration Points for Blockchain

```
Current State (Mock):
    Verification → Generate mock tx_hash → Display

Blockchain Integration (Future):
    1. Donation created
       └─ verification_event created with code

    2. On-site verification
       └─ POST /api/verify/:code/verify
          ├─ TODO: Call smart contract
          │   └─ contract.recordDonation(donationId, dataHash)
          ├─ Get tx_hash from response
          ├─ Store in verification_events.tx_hash
          └─ Return to frontend

    3. Frontend displays
       └─ Transaction hash
          └─ (Can link to blockchain explorer)

    4. Blockchain immutability
       └─ Permanent record of verification
```

## Performance Considerations

```
Database:
├─ Indexes on: id, email, status, foreign keys
├─ RLS policies optimized (direct uid checks)
├─ Connection pooling via Supabase
└─ Pagination on donations list

Frontend:
├─ Skeleton loaders for perceived performance
├─ Code splitting via Next.js
├─ Static generation where possible
└─ Image lazy loading

Backend:
├─ JWT verification once per request
├─ Minimal database queries
├─ Streaming for large responses
└─ Error handling doesn't slow down
```

## Scaling Considerations

```
Ready for:
├─ Multiple backend instances (stateless)
├─ Load balancer in front
├─ Supabase auto-scaling
├─ CDN for image serving
└─ Caching layer (Redis optional)

Database:
├─ Supabase handles replication
├─ Indexes prevent N+1 queries
├─ RLS policies don't impact performance
└─ Connection pooling ready

Blockchain:
├─ Can be moved to separate service
├─ Queue system for batch recording
├─ Retry logic for failed transactions
└─ Monitoring for gas optimization
```

## Deployment Architecture

```
Production Setup:
├─ Frontend: Vercel (Next.js optimized)
├─ Backend: Node host (Railway, Render, etc.)
├─ Database: Supabase (hosted PostgreSQL)
├─ Storage: Supabase Storage + CDN
└─ Blockchain: TBD (Web3 service)

Environment:
├─ Frontend: NEXT_PUBLIC_API_URL = production backend
├─ Backend: JWT_SECRET = strong random key
├─ Database: Production Supabase project
├─ CORS: Configure production domain
└─ SSL: Auto-handled by Vercel + Supabase
```

---

This architecture provides a solid foundation for a production food-waste redistribution platform with clear integration points for blockchain verification.
