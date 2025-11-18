-- Add table_number column to orders table
ALTER TABLE public.orders 
ADD COLUMN table_number integer;

-- Add a comment to explain the column
COMMENT ON COLUMN public.orders.table_number IS 'Table number from which the order was placed (1-10)';