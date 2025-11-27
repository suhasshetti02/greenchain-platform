/*
  # Create Core GreenChain Tables

  1. New Tables
    - `users` - User accounts with roles (donor, receiver, volunteer)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `name` (text)
      - `role` (text: 'donor', 'receiver', 'volunteer')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `donations` - Food donations from donors
      - `id` (uuid, primary key)
      - `donor_id` (uuid, foreign key to users)
      - `title` (text)
      - `category` (text: 'Prepared Meals', 'Produce', 'Frozen Meals', etc.)
      - `quantity_lbs` (numeric)
      - `unit` (text: 'lbs', 'kg', etc.)
      - `expiry_date` (timestamp)
      - `status` (text: 'available', 'claimed', 'in_transit', 'completed')
      - `location` (text)
      - `image_url` (text, nullable)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `claims` - When receivers claim donations
      - `id` (uuid, primary key)
      - `donation_id` (uuid, foreign key to donations)
      - `receiver_id` (uuid, foreign key to users)
      - `claimed_at` (timestamp)
      - `status` (text: 'pending', 'accepted', 'completed', 'cancelled')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `verification_events` - Blockchain verification stubs
      - `id` (uuid, primary key)
      - `donation_id` (uuid, foreign key to donations)
      - `event_type` (text: 'pickup', 'delivery')
      - `verification_code` (text, unique)
      - `scheduled_for` (timestamp)
      - `verified_at` (timestamp, nullable)
      - `data_hash` (text, nullable)
      - `tx_hash` (text, nullable) - Will be populated by blockchain later
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Users can only access their own data by default
    - Receivers can view and claim available donations
    - Donors can view and manage their donations

  3. Indexes
    - Email on users table (for login)
    - Donor ID on donations (for filtering by donor)
    - Donation ID on claims (for finding claims by donation)
    - Status on donations and claims (for filtering)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('donor', 'receiver', 'volunteer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  quantity_lbs numeric NOT NULL,
  unit text NOT NULL DEFAULT 'lbs',
  expiry_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'in_transit', 'completed')),
  location text NOT NULL,
  image_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(donation_id, receiver_id)
);

-- Create verification_events table
CREATE TABLE IF NOT EXISTS verification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('pickup', 'delivery')),
  verification_code text UNIQUE NOT NULL,
  scheduled_for timestamptz NOT NULL,
  verified_at timestamptz,
  data_hash text,
  tx_hash text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_claims_donation_id ON claims(donation_id);
CREATE INDEX IF NOT EXISTS idx_claims_receiver_id ON claims(receiver_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_verification_donation_id ON verification_events(donation_id);
CREATE INDEX IF NOT EXISTS idx_verification_code ON verification_events(verification_code);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anon can insert new users (register)"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for donations table
CREATE POLICY "Donors can view and manage own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid() OR status = 'available');

CREATE POLICY "Donors can create donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (donor_id = auth.uid());

CREATE POLICY "Donors can update own donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (donor_id = auth.uid())
  WITH CHECK (donor_id = auth.uid());

-- RLS Policies for claims table
CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (receiver_id = auth.uid() OR (EXISTS (
    SELECT 1 FROM donations WHERE donations.id = claims.donation_id AND donations.donor_id = auth.uid()
  )));

CREATE POLICY "Receivers can create claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (receiver_id = auth.uid());

CREATE POLICY "Receivers can update own claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- RLS Policies for verification_events table
CREATE POLICY "Users can view verification events for their donations or claims"
  ON verification_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM donations WHERE donations.id = verification_events.donation_id AND (
        donations.donor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM claims WHERE claims.donation_id = donations.id AND claims.receiver_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "System can create verification events"
  ON verification_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update verification events"
  ON verification_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
