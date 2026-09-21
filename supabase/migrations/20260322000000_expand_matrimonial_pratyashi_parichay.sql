-- Expand matrimonial_profiles for official Pratyashi Parichay form.
-- Multi-profile per user already allowed (no UNIQUE on user_id).

ALTER TABLE public.matrimonial_profiles
  ADD COLUMN IF NOT EXISTS candidate_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS birth_time text,
  ADD COLUMN IF NOT EXISTS birth_place text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS height text,
  ADD COLUMN IF NOT EXISTS complexion text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS rashi text,
  ADD COLUMN IF NOT EXISTS business_service_name text,
  ADD COLUMN IF NOT EXISTS annual_income text,
  ADD COLUMN IF NOT EXISTS brothers_married integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brothers_unmarried integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sisters_married integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sisters_unmarried integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS father_guardian_name text,
  ADD COLUMN IF NOT EXISTS father_mobile text,
  ADD COLUMN IF NOT EXISTS father_business_details text,
  ADD COLUMN IF NOT EXISTS father_annual_income text,
  ADD COLUMN IF NOT EXISTS business_office_address text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS mother_homemaker_or_service text,
  ADD COLUMN IF NOT EXISTS residential_address text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS special_statuses text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS previous_spouse_name text,
  ADD COLUMN IF NOT EXISTS previous_spouse_mobile text,
  ADD COLUMN IF NOT EXISTS previous_father_in_law_name_address text,
  ADD COLUMN IF NOT EXISTS previous_father_in_law_mobile text,
  ADD COLUMN IF NOT EXISTS sons_count integer,
  ADD COLUMN IF NOT EXISTS sons_ages text,
  ADD COLUMN IF NOT EXISTS daughters_count integer,
  ADD COLUMN IF NOT EXISTS daughters_ages text,
  ADD COLUMN IF NOT EXISTS disability_details text,
  ADD COLUMN IF NOT EXISTS declaration_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS declaration_date date,
  ADD COLUMN IF NOT EXISTS parent_signature_url text,
  ADD COLUMN IF NOT EXISTS candidate_signature_url text,
  ADD COLUMN IF NOT EXISTS approval_notes text;

UPDATE public.matrimonial_profiles mp
SET candidate_name = u.full_name
FROM public.users u
WHERE mp.user_id = u.id
  AND (mp.candidate_name IS NULL OR mp.candidate_name = '');

DROP POLICY IF EXISTS "Users can update own matrimonial" ON public.matrimonial_profiles;
CREATE POLICY "Users can update own matrimonial"
  ON public.matrimonial_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete own pending matrimonial" ON public.matrimonial_profiles;
CREATE POLICY "Users can delete own pending matrimonial"
  ON public.matrimonial_profiles FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR (auth.uid() = user_id AND COALESCE(status, 'pending') IN ('pending', 'rejected'))
  );

CREATE INDEX IF NOT EXISTS idx_matrimonial_profiles_user_id
  ON public.matrimonial_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_matrimonial_profiles_status
  ON public.matrimonial_profiles (status);
