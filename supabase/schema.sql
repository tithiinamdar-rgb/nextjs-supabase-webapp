-- ==============================================================================
-- PARTNER DESK - REAL ESTATE BUSINESS MANAGEMENT SCHEMA
-- ==============================================================================

-- 1. Profiles (Strictly for the two authorized partners)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  partner_tag TEXT NOT NULL, -- e.g. 'Partner 1', 'Partner 2'
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payments (Money To Pay & Money To Collect)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('to_pay', 'to_collect')),
  client_name TEXT NOT NULL,
  property_name TEXT,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  amount_completed NUMERIC(15, 2) NOT NULL DEFAULT 0,
  remaining_amount NUMERIC(15, 2) GENERATED ALWAYS AS (amount - amount_completed) STORED,
  due_date DATE NOT NULL,
  description TEXT,
  phone TEXT,
  assigned_to TEXT NOT NULL DEFAULT 'Both Partners',
  status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Due Today', 'Overdue', 'Partially Paid', 'Completed', 'Cancelled')),
  reminder_date DATE,
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Transactions (Partial Payments Ledger)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'Bank Transfer',
  notes TEXT,
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chits (Isolated Financial Records)
CREATE TABLE IF NOT EXISTS public.chits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  person_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  maturity_date DATE,
  category TEXT NOT NULL DEFAULT 'Property Chit',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Matured', 'Closed', 'Archived')),
  attachment_url TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notes & Categorized Folders
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Deals',
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Daily To-Do & Task Scheduler
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_time TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  assigned_to TEXT NOT NULL DEFAULT 'Both Partners',
  category TEXT NOT NULL DEFAULT 'Site Visit',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications & Reminders
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  type TEXT NOT NULL, -- 'payment_due', 'collection_overdue', 'task_reminder', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_record_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_chits_status ON public.chits(status);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON public.notes(pinned);

-- ==============================================================================
-- AUTOMATIC PAYMENT COMPLETED AMOUNT TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_payment_completed_amount()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.payments
  SET 
    amount_completed = COALESCE((
      SELECT SUM(amount) FROM public.payment_transactions WHERE payment_id = NEW.payment_id
    ), 0),
    status = CASE 
      WHEN COALESCE((SELECT SUM(amount) FROM public.payment_transactions WHERE payment_id = NEW.payment_id), 0) >= amount THEN 'Completed'
      WHEN COALESCE((SELECT SUM(amount) FROM public.payment_transactions WHERE payment_id = NEW.payment_id), 0) > 0 THEN 'Partially Paid'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.payment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_payment_balance ON public.payment_transactions;
CREATE TRIGGER trigger_update_payment_balance
AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_payment_completed_amount();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow full shared read/write for authenticated users & anon access (with app-level partner security)
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payment_transactions" ON public.payment_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to chits" ON public.chits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- DEFAULT SEED DATA (2 PARTNERS)
-- ==============================================================================
INSERT INTO public.profiles (name, email, partner_tag, phone)
VALUES 
  ('Aashu Sharma', 'aashu@partnerdesk.local', 'Partner 1', '+91 98765 43210'),
  ('Business Partner', 'partner2@partnerdesk.local', 'Partner 2', '+91 98765 12345')
ON CONFLICT (email) DO NOTHING;
