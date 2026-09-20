-- Secure public schema: privilege protection + member policies + enable RLS
-- Project: jbp-agrawal-sabha

-- 1) Protect is_admin / is_verified from client writes (service_role bypasses)
CREATE OR REPLACE FUNCTION public.protect_user_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role (Vercel API) may set privilege flags
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_admin := false;
    NEW.is_verified := false;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_admin := OLD.is_admin;
    NEW.is_verified := OLD.is_verified;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_privileges ON public.users;
CREATE TRIGGER trg_protect_user_privileges
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_privileges();

-- 2) Donations: clients cannot mark verified
CREATE OR REPLACE FUNCTION public.protect_donation_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_verified := false;
    NEW.verified_by := NULL;
    NEW.verified_at := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_verified := OLD.is_verified;
    NEW.verified_by := OLD.verified_by;
    NEW.verified_at := OLD.verified_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_donation_verification ON public.donations;
CREATE TRIGGER trg_protect_donation_verification
  BEFORE INSERT OR UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_donation_verification();

-- 3) Drop open approved_members read for all authenticated (use API instead)
DROP POLICY IF EXISTS "Allow authenticated users to read approved members" ON public.approved_members;

-- 4) Admin full access on users (list / manage via RLS for reads; privilege writes via API+trigger)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- 5) Member content policies (app continues to work with RLS on)

-- Events: public read of approved+visible; authenticated insert pending
DROP POLICY IF EXISTS "Anyone can view approved visible events" ON public.events;
CREATE POLICY "Anyone can view approved visible events"
  ON public.events FOR SELECT
  USING (
    public.is_admin()
    OR (status = 'approved' AND COALESCE(is_visible, true) = true)
  );

DROP POLICY IF EXISTS "Authenticated users can create pending events" ON public.events;
CREATE POLICY "Authenticated users can create pending events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = posted_by
    AND COALESCE(status, 'pending') = 'pending'
  );

-- Jobs
DROP POLICY IF EXISTS "Anyone can view approved jobs" ON public.jobs;
CREATE POLICY "Anyone can view approved jobs"
  ON public.jobs FOR SELECT
  USING (public.is_admin() OR status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can create pending jobs" ON public.jobs;
CREATE POLICY "Authenticated users can create pending jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = posted_by
    AND COALESCE(status, 'pending') = 'pending'
  );

-- Matrimonial
DROP POLICY IF EXISTS "Anyone can view approved matrimonial" ON public.matrimonial_profiles;
CREATE POLICY "Anyone can view approved matrimonial"
  ON public.matrimonial_profiles FOR SELECT
  USING (
    public.is_admin()
    OR status = 'approved'
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create own matrimonial" ON public.matrimonial_profiles;
CREATE POLICY "Users can create own matrimonial"
  ON public.matrimonial_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND COALESCE(status, 'pending') = 'pending'
  );

-- Blood donors
DROP POLICY IF EXISTS "Anyone can view available blood donors" ON public.blood_donors;
CREATE POLICY "Anyone can view available blood donors"
  ON public.blood_donors FOR SELECT
  USING (public.is_admin() OR is_available = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can register as blood donor" ON public.blood_donors;
CREATE POLICY "Users can register as blood donor"
  ON public.blood_donors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own blood donor row" ON public.blood_donors;
CREATE POLICY "Users can update own blood donor row"
  ON public.blood_donors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Donations: readable by authenticated; insert by authenticated
DROP POLICY IF EXISTS "Authenticated can view donations" ON public.donations;
CREATE POLICY "Authenticated can view donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated can record donations" ON public.donations;
CREATE POLICY "Authenticated can record donations"
  ON public.donations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Post holders: public read
DROP POLICY IF EXISTS "Anyone can view post holders" ON public.post_holders;
CREATE POLICY "Anyone can view post holders"
  ON public.post_holders FOR SELECT
  USING (true);

-- Contact requests
DROP POLICY IF EXISTS "Users can create contact requests" ON public.contact_requests;
CREATE POLICY "Users can create contact requests"
  ON public.contact_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can view own contact requests" ON public.contact_requests;
CREATE POLICY "Users can view own contact requests"
  ON public.contact_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_id OR public.is_admin());

-- Deletion requests
DROP POLICY IF EXISTS "Anyone can create deletion requests" ON public.deletion_requests;
CREATE POLICY "Anyone can create deletion requests"
  ON public.deletion_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage deletion requests" ON public.deletion_requests;
CREATE POLICY "Admins manage deletion requests"
  ON public.deletion_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin logs: admin read/insert
DROP POLICY IF EXISTS "Admins manage admin logs" ON public.admin_logs;
CREATE POLICY "Admins manage admin logs"
  ON public.admin_logs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- App settings
DROP POLICY IF EXISTS "Public read app settings" ON public.app_settings;
CREATE POLICY "Public read app settings"
  ON public.app_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage app settings" ON public.app_settings;
CREATE POLICY "Admins manage app settings"
  ON public.app_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6) Enable RLS on all public tables that need it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrimonial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
