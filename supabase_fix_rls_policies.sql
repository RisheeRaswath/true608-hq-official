-- CRITICAL FIX: RLS Policies for Technician Access
-- Run this in your Supabase SQL Editor to fix cylinder creation and compliance log insertion

-- 1. FIX CYLINDERS TABLE: Allow authenticated users (technicians) to INSERT new cylinders
-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Admins and owners can manage cylinders" ON public.cylinders;

-- Allow authenticated users to INSERT cylinders (for new cylinder creation)
CREATE POLICY "Authenticated users can insert cylinders" ON public.cylinders
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Keep existing SELECT and UPDATE policies
-- (These should already exist from the migration)

-- 2. FIX COMPLIANCE_LOGS TABLE: Ensure technicians can insert logs
-- Verify the existing policy allows tech_id to match auth.uid()
-- If not working, recreate it:
DROP POLICY IF EXISTS "Techs can create logs" ON public.compliance_logs;

CREATE POLICY "Techs can create logs" ON public.compliance_logs
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = tech_id);

-- 3. FIX ASSETS TABLE: Allow technicians to INSERT assets (for Quick Add)
DROP POLICY IF EXISTS "Admins and owners can manage assets" ON public.assets;

-- Allow authenticated users to INSERT assets
CREATE POLICY "Authenticated users can insert assets" ON public.assets
  FOR INSERT TO authenticated 
  WITH CHECK (true);

-- Keep SELECT policy for viewing assets
-- (Should already exist)

-- 4. VERIFY: Check that all policies are active
-- Run this query to verify:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('cylinders', 'compliance_logs', 'assets');


