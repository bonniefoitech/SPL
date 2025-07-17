/*
  # Wallet and Transactions System

  1. New Tables
    - `user_wallets` - Stores user wallet information
    - `transactions` - Records all financial transactions
    - `payment_methods` - Stores user payment methods
    - `withdrawal_requests` - Tracks withdrawal requests

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- User Wallets Table
CREATE TABLE IF NOT EXISTS user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  locked_balance numeric(12,2) NOT NULL DEFAULT 0,
  total_deposited numeric(12,2) NOT NULL DEFAULT 0,
  total_withdrawn numeric(12,2) NOT NULL DEFAULT 0,
  total_winnings numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint to ensure balances are not negative
ALTER TABLE user_wallets ADD CONSTRAINT positive_balances 
  CHECK (balance >= 0 AND locked_balance >= 0);

-- Create unique index on user_id
CREATE UNIQUE INDEX idx_user_wallets_user_id ON user_wallets(user_id);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'contest_entry', 'contest_win', 'refund', 'bonus')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description text NOT NULL,
  reference_id text,
  payment_method_id uuid,
  contest_id uuid REFERENCES contests(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('card', 'upi', 'netbanking', 'wallet')),
  name text NOT NULL,
  details jsonb NOT NULL,
  is_default boolean DEFAULT false,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for payment methods
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  bank_details jsonb,
  admin_notes text,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for withdrawal requests
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Enable Row Level Security
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_wallets
CREATE POLICY "Users can view their own wallet"
  ON user_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment methods"
  ON payment_methods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON payment_methods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for withdrawal_requests
CREATE POLICY "Users can view their own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create or replace function to get user wallet
CREATE OR REPLACE FUNCTION get_user_wallet(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  balance numeric,
  locked_balance numeric,
  available_balance numeric,
  total_deposited numeric,
  total_withdrawn numeric,
  total_winnings numeric,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  -- Create wallet if it doesn't exist
  INSERT INTO user_wallets (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Return wallet with available balance calculated
  RETURN QUERY
  SELECT 
    w.id,
    w.user_id,
    w.balance,
    w.locked_balance,
    (w.balance - w.locked_balance) as available_balance,
    w.total_deposited,
    w.total_withdrawn,
    w.total_winnings,
    w.created_at,
    w.updated_at
  FROM user_wallets w
  WHERE w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to get user transactions with filtering
CREATE OR REPLACE FUNCTION get_user_transactions(
  p_user_id uuid,
  p_type text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  amount numeric,
  type text,
  status text,
  description text,
  reference_id text,
  payment_method_id uuid,
  contest_id uuid,
  created_at timestamptz,
  total_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.amount,
    t.type,
    t.status,
    t.description,
    t.reference_id,
    t.payment_method_id,
    t.contest_id,
    t.created_at,
    COUNT(*) OVER() as total_count
  FROM transactions t
  WHERE t.user_id = p_user_id
    AND (p_type IS NULL OR t.type = p_type)
    AND (p_status IS NULL OR t.status = p_status)
    AND (p_start_date IS NULL OR t.created_at >= p_start_date)
    AND (p_end_date IS NULL OR t.created_at <= p_end_date)
  ORDER BY t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to process a deposit
CREATE OR REPLACE FUNCTION process_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_payment_method_id uuid DEFAULT NULL,
  p_reference_id text DEFAULT NULL,
  p_description text DEFAULT 'Wallet deposit'
)
RETURNS uuid AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Deposit amount must be greater than zero';
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description,
    payment_method_id,
    reference_id
  ) VALUES (
    p_user_id,
    p_amount,
    'deposit',
    'completed',
    p_description,
    p_payment_method_id,
    p_reference_id
  ) RETURNING id INTO v_transaction_id;
  
  -- Update wallet balance
  INSERT INTO user_wallets (
    user_id,
    balance,
    total_deposited
  ) VALUES (
    p_user_id,
    p_amount,
    p_amount
  )
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_wallets.balance + p_amount,
    total_deposited = user_wallets.total_deposited + p_amount,
    updated_at = now();
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to request a withdrawal
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_user_id uuid,
  p_amount numeric,
  p_payment_method_id uuid DEFAULT NULL,
  p_bank_details jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_available_balance numeric;
  v_request_id uuid;
  v_transaction_id uuid;
BEGIN
  -- Get available balance
  SELECT (balance - locked_balance) INTO v_available_balance
  FROM user_wallets
  WHERE user_id = p_user_id;
  
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero';
  END IF;
  
  -- Check if user has sufficient balance
  IF v_available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient available balance';
  END IF;
  
  -- Create transaction record (pending)
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description,
    payment_method_id
  ) VALUES (
    p_user_id,
    -p_amount, -- negative amount for withdrawals
    'withdrawal',
    'pending',
    'Withdrawal request',
    p_payment_method_id
  ) RETURNING id INTO v_transaction_id;
  
  -- Create withdrawal request
  INSERT INTO withdrawal_requests (
    user_id,
    amount,
    status,
    payment_method_id,
    bank_details,
    transaction_id
  ) VALUES (
    p_user_id,
    p_amount,
    'pending',
    p_payment_method_id,
    p_bank_details,
    v_transaction_id
  ) RETURNING id INTO v_request_id;
  
  -- Lock the amount in the wallet
  UPDATE user_wallets
  SET locked_balance = locked_balance + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to process contest entry fee
CREATE OR REPLACE FUNCTION process_contest_entry(
  p_user_id uuid,
  p_contest_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_entry_fee numeric;
  v_available_balance numeric;
  v_contest_title text;
BEGIN
  -- Get contest details
  SELECT entry_fee, title INTO v_entry_fee, v_contest_title
  FROM contests
  WHERE id = p_contest_id;
  
  -- Get available balance
  SELECT (balance - locked_balance) INTO v_available_balance
  FROM user_wallets
  WHERE user_id = p_user_id;
  
  -- Check if user has sufficient balance
  IF v_available_balance < v_entry_fee THEN
    RAISE EXCEPTION 'Insufficient available balance';
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description,
    contest_id
  ) VALUES (
    p_user_id,
    -v_entry_fee, -- negative amount for entry fees
    'contest_entry',
    'completed',
    'Entry fee for ' || v_contest_title,
    p_contest_id
  );
  
  -- Update wallet balance
  UPDATE user_wallets
  SET balance = balance - v_entry_fee,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to process contest winnings
CREATE OR REPLACE FUNCTION process_contest_winnings(
  p_user_id uuid,
  p_contest_id uuid,
  p_amount numeric,
  p_rank integer
)
RETURNS boolean AS $$
DECLARE
  v_contest_title text;
BEGIN
  -- Get contest details
  SELECT title INTO v_contest_title
  FROM contests
  WHERE id = p_contest_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description,
    contest_id
  ) VALUES (
    p_user_id,
    p_amount,
    'contest_win',
    'completed',
    'Prize for rank #' || p_rank || ' in ' || v_contest_title,
    p_contest_id
  );
  
  -- Update wallet balance
  UPDATE user_wallets
  SET balance = balance + p_amount,
      total_winnings = total_winnings + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_wallet();