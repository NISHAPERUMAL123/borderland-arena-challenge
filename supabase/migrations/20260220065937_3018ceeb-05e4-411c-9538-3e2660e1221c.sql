-- Allow authenticated users to insert their own role (for initial admin signup)
CREATE POLICY "Users can self-assign role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);