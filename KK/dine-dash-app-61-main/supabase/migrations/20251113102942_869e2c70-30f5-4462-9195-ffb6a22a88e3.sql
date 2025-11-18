-- Add DELETE policy for admins on table_reservations
CREATE POLICY "Admins can delete reservations"
ON public.table_reservations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));